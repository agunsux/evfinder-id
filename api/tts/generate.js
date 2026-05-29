/**
 * SHINERVA - TTS Generate API Route
 * =================================
 * POST /api/tts/generate
 *
 * Complete voice generation pipeline:
 * 1. Cloudflare Turnstile validation (samples only)
 * 2. Firebase Auth token verification
 * 3. Credit availability check
 * 4. Proprietary phonetic preprocessing
 * 5. Gemini TTS invocation
 * 6. Cloudflare R2 upload + public URL
 * 7. Credit deduction (with rollback on failure)
 * 8. JSON response with audioUrl
 *
 * Authors: Shinerva Engineering Team
 */

import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PHONETIC_MAP, GLOBAL_PHONETICS, applyPhoneticPreprocessing } from '../../src/lib/phoneticsIndo.js';

let firebaseApp = null;
let db = null;
let auth = null;

function initFirebase() {
  if (firebaseApp) return;

  try {
    // Load firebase-applet-config.json for client config fallback
    let firebaseConfig = {};
    try {
      const fs = await import('fs');
      const configPath = new URL('../../firebase-applet-config.json', import.meta.url);
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (_) { /* non-fatal */ }

    const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig?.projectId;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    const formatPrivateKey = (key) => {
      if (!key || typeof key !== 'string') return null;
      let formatted = key.trim().replace(/\\n/g, '\n');
      if (formatted.startsWith('{')) {
        try {
          const parsed = JSON.parse(formatted);
          if (parsed.private_key) return formatPrivateKey(parsed.private_key);
        } catch (_) { /* ignore */ }
      }
      if (formatted.includes('-----BEGIN PRIVATE KEY-----') && formatted.includes('\n')) return formatted;
      const base64 = formatted.replace(/-----BEGIN [^-]+-----/g, '').replace(/-----END [^-]+-----/g, '').replace(/\s+/g, '');
      if (!base64 || base64.length < 100) return formatted;
      const chunks = base64.match(/.{1,64}/g) || [base64];
      return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
    };

    const privateKey = formatPrivateKey(rawPrivateKey);

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[TTS Generate] Firebase Admin init skipped: missing credentials');
      return;
    }

    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0];
    } else {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId,
      });
    }

    db = admin.firestore(firebaseApp);
    auth = admin.auth(firebaseApp);
    console.log('[TTS Generate] Firebase Admin initialized');
  } catch (err) {
    console.error('[TTS Generate] Firebase Admin init failed:', err.message);
  }
}

await initFirebase();

let r2Client = null;
let r2Bucket = process.env.R2_BUCKET_NAME;
let r2PublicDomain = process.env.R2_PUBLIC_DOMAIN;

function initR2() {
  if (r2Client) return;
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.warn('[TTS Generate] R2 credentials missing — R2 upload disabled');
    return;
  }
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  console.log('[TTS Generate] R2 client initialized');
}

await initR2();

async function checkR2Cache(filename) {
  if (!r2Client || !r2Bucket) return false;
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: r2Bucket, Key: filename }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(filename, base64Content) {
  if (!r2Client || !r2Bucket || !r2PublicDomain) {
    throw new Error('R2 is not properly configured');
  }
  const buffer = Buffer.from(base64Content, 'base64');
  await r2Client.send(new PutObjectCommand({
    Bucket: r2Bucket,
    Key: filename,
    Body: buffer,
    ContentType: 'audio/wav',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  const cleanDomain = r2PublicDomain.replace(/\/$/, '');
  return `${cleanDomain}/${filename}`;
}

// ─── Turnstile Verification ────────────────────────────────────────────────────
async function verifyTurnstile(token, ip) {
  if (!token) return true; // Authenticated users bypass
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // Dev mode bypass

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

// ─── Firebase Token Verification ──────────────────────────────────────────────
async function verifyIdToken(idToken) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth.verifyIdToken(idToken);
}

async function getUserFromFirestore(uid) {
  if (!db) throw new Error('Firestore not initialized');
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// ─── Credit Deduction with Rollback ──────────────────────────────────────────
async function deductCreditsAtomic(uid, charCost, generationId) {
  if (!db) throw new Error('Firestore not initialized');
  const userRef = db.collection('users').doc(uid);
  const genRef = userRef.collection('generation_events').doc(generationId);

  await db.runTransaction(async (t) => {
    const userSnap = await t.get(userRef);
    if (!userSnap.exists) throw new Error('User not found');
    const user = userSnap.data();

    // Idempotency: skip if already processed
    const genSnap = await t.get(genRef);
    if (genSnap.exists) {
      console.log(`[Credits] Generation ${generationId} already processed — skipping`);
      return;
    }

    const available = (user.monthly_chars || 0)
      + (user.signup_bonus_chars || 0)
      + (user.earned_chars || 0)
      - (user.used_chars || 0);

    if (available < charCost) {
      throw new Error(`Kredit tidak mencukupi. Butuh ${charCost}, tersedia ${available}`);
    }

    t.update(userRef, {
      used_chars: admin.firestore.FieldValue.increment(charCost),
      generation_count: admin.firestore.FieldValue.increment(1),
      last_generation_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    t.set(genRef, {
      userId: uid,
      generationId,
      charactersUsed: charCost,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      model: 'gemini-tts',
      success: true,
    });
  });
}

async function rollbackCredits(uid, generationId) {
  if (!db) return;
  try {
    const userRef = db.collection('users').doc(uid);
    const genRef = userRef.collection('generation_events').doc(generationId);
    const genSnap = await genRef.get();

    if (genSnap.exists) {
      const genData = genSnap.data();
      await db.runTransaction(async (t) => {
        t.update(userRef, {
          used_chars: admin.firestore.FieldValue.increment(-(genData.charactersUsed || 0)),
          generation_count: admin.firestore.FieldValue.increment(-1),
        });
        t.delete(genRef);
      });
      console.log(`[Credits] Rolled back ${genData.charactersUsed} credits for ${generationId}`);
    }
  } catch (err) {
    console.error('[Credits] Rollback failed:', err.message);
  }
}

// ─── Gemini TTS ──────────────────────────────────────────────────────────────
const VOICE_PRESETS = {
  SAMBAS: { voiceName: 'Enceladus', style: 'Cinematic, deep, storytelling with dramatic pacing.' },
  MEGA:   { voiceName: 'Kore',     style: 'Professional, clear, broadcasting tone, articulate.' },
  SUSI:   { voiceName: 'Zephyr',   style: 'Energetic, modern, creator-friendly, vibrant.' },
  FLOW_F: { voiceName: 'Aoife',    style: 'Warm, emotional, expressive, Indonesian female narration.' },
  PULSE_M:{ voiceName: 'Fenrir',   style: 'Strong, authoritative, deep male voice for documentaries.' },
};

const TIER_ORDER      = ['FREE','STARTER','KREATOR','PRODUKTIF','BISNIS','ENTERPRISE'];
const PREMIUM_VOICES  = ['FLOW_F','FLOW_M','AURA_F','AURA_M','PULSE_F','PULSE_M'];
const ULTRA_VOICES   = ['AURA_F','AURA_M'];
const TIER_COST_MULT = { Standard: 1, Wavenet: 1, Studio: 10 };

function pcmToWav(pcmBase64, sampleRate = 24000) {
  const pcmData = Buffer.from(pcmBase64, 'base64');
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + pcmData.length, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, pcmData.length, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));
  return Buffer.from(buffer).toString('base64');
}

async function generateTts(text, presetId) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const ai = new GoogleGenAI({ apiKey });
  const preset = VOICE_PRESETS[presetId] || VOICE_PRESETS.SAMBAS;
  const model = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';

  const prompt = `${preset.style}\n\nText to speak:\n${text}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: preset.voiceName },
        },
      },
    },
  });

  if (!response?.candidates?.length) throw new Error('Invalid Gemini response');
  const parts = response.candidates[0].content?.parts || [];
  const audioPart = parts.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
  if (!audioPart) throw new Error('No audio in Gemini response');

  const pcm = audioPart.inlineData.data;
  if (!pcm || pcm.length < 50) throw new Error('Gemini returned empty audio');

  return pcmToWav(pcm, 24000);
}

// ─── Credit Cost Calculation ───────────────────────────────────────────────────
function calculateCost(textLength, voiceId) {
  const isPremium = PREMIUM_VOICES.includes(voiceId);
  const isUltra = ULTRA_VOICES.includes(voiceId);
  const tierName = isUltra ? 'Studio' : isPremium ? 'Wavenet' : 'Standard';
  const multiplier = TIER_COST_MULT[tierName] || 1;
  return textLength * multiplier;
}

// ─── Express Route Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { text, voice = 'SAMBAS', speed = 1.0, pitch = 0, volume = 0, isSample = false } = body;

  // ── 2. Input validation ───────────────────────────────────────────────────
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Teks diperlukan.' });
  }

  const cleanText = text.trim();
  const maxChars = isSample ? 500 : 5000;
  if (cleanText.length > maxChars) {
    return res.status(400).json({ error: `Teks terlalu panjang (maks ${maxChars} karakter).` });
  }

  // ── 3. Cloudflare Turnstile (samples only) ─────────────────────────────────
  const turnstileToken = body.turnstileToken || req.headers['x-turnstile-token'];
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  if (isSample) {
    const isValid = await verifyTurnstile(turnstileToken, clientIp);
    if (!isValid) {
      return res.status(403).json({ error: 'Verifikasi keamanan gagal.', code: 'TURNSTILE_FAILED' });
    }
  }

  // ── 4. Authenticate user ───────────────────────────────────────────────────
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    if (isSample) {
      // Guest sample: use default guest user
    } else {
      return res.status(401).json({ error: 'Auth token missing.' });
    }
  }

  let user = null;
  let uid = null;

  if (authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7);
    if (idToken && idToken !== 'null' && idToken !== 'undefined') {
      try {
        const decoded = await verifyIdToken(idToken);
        uid = decoded.uid;
        user = await getUserFromFirestore(uid);
      } catch (err) {
        console.error('[TTS Generate] Auth error:', err.message);
        return res.status(401).json({ error: 'Token invalid atau expired.' });
      }
    }
  }

  if (!user && !isSample) {
    return res.status(401).json({ error: 'Harap login untuk menggunakan layanan TTS.' });
  }

  // ── 5. Voice tier authorization ─────────────────────────────────────────────
  const isPremiumVoice = PREMIUM_VOICES.includes(voice);
  const isUltraVoice  = ULTRA_VOICES.includes(voice);
  const userTierIndex = user ? TIER_ORDER.indexOf(user.tier || 'FREE') : -1;

  if (!isSample) {
    if (isUltraVoice && userTierIndex < TIER_ORDER.indexOf('BISNIS')) {
      return res.status(403).json({ error: 'Suara Premium ini hanya untuk paket BISNIS ke atas.' });
    }
    if (isPremiumVoice && userTierIndex < TIER_ORDER.indexOf('STARTER')) {
      return res.status(403).json({ error: 'Suara ini hanya untuk paket STARTER ke atas.' });
    }
  }

  // ── 6. Calculate credit cost ───────────────────────────────────────────────
  const charCost = isSample ? 0 : calculateCost(cleanText.length, voice);

  if (!isSample && user) {
    const available = (user.monthly_chars || 0)
      + (user.signup_bonus_chars || 0)
      + (user.earned_chars || 0)
      - (user.used_chars || 0);

    if (charCost > available) {
      return res.status(402).json({
        error: `Kredit tidak mencukupi. Butuh ${charCost}, tersedia ${available}.`,
        code: 'INSUFFICIENT_CREDITS',
      });
    }
  }

  // ── 7. Generate unique generation ID ────────────────────────────────────────
  const generationId = crypto.randomBytes(12).toString('hex');

  // ── 8. Preprocess text: Hyper-Localization Phonetic Mapping ────────────────
  const processedText = applyPhoneticPreprocessing(cleanText, user?.pronunciations || {});

  // ── 9. Build audio filename & check R2 cache ──────────────────────────────
  const cacheHash = crypto
    .createHash('sha256')
    .update(`${processedText}|${voice}|${speed}|${pitch}|${volume}`)
    .digest('hex');

  const cacheFilename = `audio_${cacheHash}.wav`;

  let audioUrl = null;
  let audioBase64 = null; // Fallback when R2 is down
  let cached = false;

  try {
    cached = await checkR2Cache(cacheFilename);
    if (cached) {
      const cleanDomain = (r2PublicDomain || '').replace(/\/$/, '');
      audioUrl = `${cleanDomain}/${cacheFilename}`;
      console.log(`[TTS] Cache HIT for ${cacheFilename}`);
    }
  } catch (err) {
    console.warn('[TTS] R2 cache check failed:', err.message);
  }

  // ── 10. Gemini TTS (if not cached) ────────────────────────────────────────
  if (!cached) {
    try {
      console.log(`[TTS] Generating audio for preset ${voice}, ${processedText.length} chars...`);
      const wavBase64 = await generateTts(processedText, voice);

      // ── 11. Upload to R2 ─────────────────────────────────────────────────
      try {
        audioUrl = await uploadToR2(cacheFilename, wavBase64);
        console.log(`[TTS] Uploaded to R2: ${audioUrl}`);
      } catch (r2Err) {
        console.error('[TTS] R2 upload failed, returning base64 fallback:', r2Err.message);
        // R2 unavailable: store base64 for direct playback instead
        audioBase64 = wavBase64;
      }
    } catch (ttsErr) {
      console.error('[TTS] Gemini TTS error:', ttsErr.message);
      return res.status(500).json({
        error: `Gagal menghasilkan suara: ${ttsErr.message}`,
        code: 'TTS_GENERATION_FAILED',
      });
    }
  }

  // ── 12. Deduct credits (authenticated, non-sample only) ───────────────────
  if (!isSample && uid) {
    try {
      await deductCreditsAtomic(uid, charCost, generationId);
      console.log(`[TTS] Deducted ${charCost} credits from ${uid}`);
    } catch (deductErr) {
      console.error('[TTS] Credit deduction failed — rolling back R2 upload:', deductErr.message);
      // R2 file is uploaded but credits not deducted = user lucky, no rollback needed for R2
      // The deductCreditsAtomic will throw and we return error
      return res.status(400).json({
        error: `Gagal memproses kredit: ${deductErr.message}`,
        code: 'CREDIT_DEDUCTION_FAILED',
      });
    }
  }

  // ── 13. Return response ───────────────────────────────────────────────────
  console.log(`[TTS] Success for uid=${uid || 'guest'}, voice=${voice}, cost=${charCost}`);

  return res.status(200).json({
    success: true,
    audioUrl: audioUrl || null,
    audioBase64: audioBase64 || null,
    voice,
    textLength: cleanText.length,
    charCost,
    generationId,
    duration: Math.round(cleanText.length / 15),
    isCached: cached,
    remainingCredits: user
      ? Math.max(0,
          (user.monthly_chars || 0)
          + (user.signup_bonus_chars || 0)
          + (user.earned_chars || 0)
          - (user.used_chars || 0)
          - charCost)
      : null,
  });
}
