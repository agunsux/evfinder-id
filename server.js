import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import admin, { authAdmin, dbAdmin, setDbAdmin, getFirestoreDb, initErrorMsg } from './src/lib/firebaseAdmin.js';
import { fileURLToPath } from 'url';
import { deductCredits } from './server/services/credits.js';
import adminOnly from './server/middleware/adminOnly.js';
import { getActiveCount, increment, decrement } from './server/rateLimiterStore.js';

import { GoogleAuth } from 'google-auth-library';
import { checkAudioCache, uploadAudioToR2, getAudioPublicUrl } from './src/lib/r2Storage.js';
import { generateGeminiTts } from './server/services/geminiTts.js';
import { validateEnv } from './server/lib/env.js';
import { verifyTurnstile } from './server/middleware/verifyTurnstile.js';
import { applyPhoneticMoat } from './server/lib/phonetics.js';

validateEnv();

let googleAuthClient = null;
async function synthesizeWithGoogleTTS(text) {
  let authMethod = 'none';
  let url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const headers = { 'Content-Type': 'application/json' };

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    url += `?key=${apiKey}`;
    authMethod = 'api_key';
    console.log(`[Google Cloud TTS] Using API key auth (${apiKey.slice(0, 8)}...)`);
  } else {
    try {
      const authClient = getGoogleAuthClient();
      if (authClient) {
        const client = await authClient.getClient();
        const token = await client.getAccessToken();
        if (token?.token) {
          headers['Authorization'] = `Bearer ${token.token}`;
          authMethod = 'oauth';
          console.log(`[Google Cloud TTS] Using OAuth token via Firebase service account`);
        }
      }
    } catch (e) {
      console.warn('[Google Cloud TTS] OAuth token fetch failed:', e.message);
    }
  }

  if (authMethod === 'none') {
    throw new Error('No Google Cloud TTS credentials available: set GOOGLE_API_KEY or ensure Firebase service account has Cloud TTS IAM permissions');
  }

  const body = {
    input: { text },
    voice: { languageCode: 'id-ID', name: 'id-ID-Standard-A' },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 }
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Google Cloud TTS returned ${res.status} (auth:${authMethod}): ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    if (!data.audioContent) throw new Error('No audioContent in response');
    const audioSize = data.audioContent.length;
    console.log(`[Google Cloud TTS] Success: ${(audioSize * 0.75 / 1024).toFixed(1)}KB MP3 (auth:${authMethod})`);
    if (audioSize < 100) {
      throw new Error(`Google Cloud TTS returned too-small audio (${audioSize} chars)`);
    }
    return { audioContent: data.audioContent, mimeType: 'audio/mpeg' };
  } catch (e) {
    console.error('[Google Cloud TTS] Failed:', e.message);
    throw e;
  }
}

function getGoogleAuthClient() {
  if (!googleAuthClient && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    let pk = process.env.FIREBASE_PRIVATE_KEY;
    if (pk.startsWith('{')) {
      try { pk = JSON.parse(pk).private_key; } catch(e){}
    }
    googleAuthClient = new GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: pk.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }
  return googleAuthClient;
}

const getFilename = () => {
  try {
    return fileURLToPath(import.meta.url);
  } catch (e) {
    return path.resolve(process.argv[1] || 'server.js');
  }
};
const __filename = getFilename();
const __dirname = path.dirname(__filename);


let firebaseConfig = {};
try {
  const configPath = new URL('./firebase-applet-config.json', import.meta.url);
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn("[Server] Failed to load firebase-applet-config.json:", e.message);
}

// --- Startup Check ---
if (!authAdmin) {
  console.warn("==============================================================");
  console.warn("WARNING: FIREBASE ADMIN INITIALIZATION FAILED");
  if (initErrorMsg) console.warn(`Reason: ${initErrorMsg}`);
  console.warn("Authentication and database features will be LIMITED.");
  console.warn("Please check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,");
  console.warn("and FIREBASE_PRIVATE_KEY secrets in AI Studio Settings.");
  console.warn("==============================================================");
}
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI, Modality } from "@google/genai";
import { PLANS as FRONTEND_PLANS } from './src/lib/plans.js';

// Server-side source of truth plan configuration
const PLANS = {
  CREATOR: {
    price: 99000,
    chars: 200000
  },
  PRO: {
    price: 199000,
    chars: 600000
  }
};


const clean = (val) => {
  if (val === null || val === undefined) return "";
  let res = String(val).trim();
  if (res === "null" || res === "undefined" || res === "") return "";
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1).trim();
  }
  return res.replace(/[\u200B-\u200D\ufeff\u00a0\u0000-\u001F\u007F-\u009F]/g, "");
};

const apiKey = clean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// --- VOICE CONFIG ---
let voiceConfig = {
  tiers: {
    'Standard': 1,
    'Wavenet': 1,
    'Studio': 10
  },
  limits: {
    free_request_chars: 500,
    paid_request_chars: 5000,
    free_cooldown_sec: 15,
    paid_cooldown_sec: 2
  }
};

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}
function generateRefCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function loadInitialConfig() {
  if (!dbAdmin) {
    console.warn("[Firebase] Skipping initial config: dbAdmin is null.");
    return;
  }
  
  const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
  console.log(`[Firebase] Handshake with database: ${dbId}`);
  
  try {
    await dbAdmin.collection('_system_').limit(1).get();
    console.log("[Firebase] Database connection verified.");
  } catch (err) {
    const isDbMissing = err.message?.includes('does not exist for project');
    const isNotFound = err.code === 5 || err.code === 'not-found' ||
                      String(err.message).includes("NOT_FOUND") ||
                      String(err.message).includes("not-found");

    if (isDbMissing) {
      if (dbId !== "(default)") {
        console.warn(`[Firebase] Named database '${dbId}' not found. Falling back to (default)...`);
        const fallbackDb = getFirestoreDb("(default)");
        if (fallbackDb) {
          setDbAdmin(fallbackDb);
          try {
            await fallbackDb.collection('_system_').limit(1).get();
            console.log("[Firebase] Fallback to (default) database successful.");
          } catch (fallbackErr) {
            const isFallbackMissing = fallbackErr.message?.includes('does not exist for project');
            if (isFallbackMissing) {
              console.error("[Firebase] No database available. App will run with limited profile features.");
              setDbAdmin(null);
            } else {
              console.log("[Firebase] Fallback database accessible (with minor warning).");
            }
          }
        }
      } else {
        console.error("[Firebase] The (default) database is missing. App will run in limited mode.");
        setDbAdmin(null);
      }
    } else if (isNotFound) {
      console.log("[Firebase] Health check document not found (normal). Database is accessible.");
    } else {
      console.warn("[Firebase] Handshake warning (non-fatal):", err.message);
    }
  }

  // Load config after verified
  if (dbAdmin) {
    try {
      const doc = await dbAdmin.collection('config').doc('voices').get();
      if (doc.exists) {
        voiceConfig = { ...voiceConfig, ...doc.data() };
        console.log("[Firebase] Global voice config loaded.");
      }
    } catch (err) {
      console.warn("[Firebase] Could not load global config doc (config/voices), using defaults.");
    }
  }
}

async function getUser(uid) {
  if (!dbAdmin) return null;
  try {
    const doc = await dbAdmin.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error(`[Firestore] getUser error for ${uid}:`, err.message);
    return null;
  }
}

async function saveUser(uid, userData) {
  if (!dbAdmin) { console.error(`[Firestore] saveUser skipped for ${uid}: dbAdmin is null`); return false; }
  try {
    await dbAdmin.collection('users').doc(uid).set(userData, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firestore] saveUser error for ${uid}:`, err.message);
    return false;
  }
}

async function incrementUserField(uid, field, amount) {
  if (!dbAdmin) { console.error(`[Firestore] incrementUserField skipped for ${uid}: dbAdmin is null`); return false; }
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    await dbAdmin.collection('users').doc(uid).update({ [field]: FieldValue.increment(amount) });
    return true;
  } catch (err) {
    console.error(`[Firestore] incrementUserField error for ${uid}.${field}:`, err.message);
    return false;
  }
}

async function getUserField(uid, field) {
  if (!dbAdmin) return null;
  try {
    const doc = await dbAdmin.collection('users').doc(uid).get();
    return doc.exists ? doc.data()[field] : null;
  } catch (err) {
    console.error(`[Firestore] getUserField error for ${uid}.${field}:`, err.message);
    return null;
  }
}

async function findUserByEmail(email) {
  if (!dbAdmin) return null;
  try {
    const snapshot = await dbAdmin.collection('users').where('email', '==', email).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  } catch (err) {
    console.error(`[Firestore] findUserByEmail error for ${email}:`, err.message);
    return null;
  }
}

async function createServer() {
  console.log("[Server] Initializing...");
  await loadInitialConfig();
  
  const app = express();
  // Trust proxy for correct client IP handling behind Vercel/Railway
  app.set('trust proxy', 1);
  // Strict CORS configuration - only allow origins specified in CORS_ORIGIN env var
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(o => o);
  app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }));
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: true, limit: '32kb' }));

  // Force JSON for all API routes and prevent HTML fallthrough
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Backend-Server', 'Shinerva');
    // Prevent Nginx or Vite from accidentally serving cached HTML for API routes
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // Global API Logger
  app.use('/api', (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
  });

  const authenticate = async (req, res, next) => {
    if (!authAdmin) {
      console.error("[Firebase Admin] Auth is not initialized. Check server environment variables.");
      return res.status(503).json({ error: 'Sistem autentikasi sementara tidak tersedia.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Auth token missing' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken || idToken === 'null' || idToken === 'undefined') {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
      if (!authAdmin) {
        return res.status(503).json({ error: 'Firebase Admin not initialized on server. Please set service account secrets.', detail: initErrorMsg });
      }
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      let email = decodedToken.email;
      
      // Fallback: if email not in token, fetch from Firebase Auth
      if (!email) {
        try {
          const firebaseUser = await authAdmin.getUser(uid);
          email = firebaseUser.email;
          console.log(`[Auth] Email fetched from Auth API for ${uid}: ${email}`);
        } catch (fetchErr) {
          console.error(`[Auth] Failed to fetch user ${uid} from Auth API:`, fetchErr.message);
        }
      }
      
      if (!email) {
        console.warn(`[Auth] Token for ${uid} has no email, using uid-based placeholder`);
        email = `user-${uid}@placeholder.shinerva.id`;
      }

      // Sync with Firestore
      let user = await getUser(uid);
      
      const currentEmailVerified = !!decodedToken.email_verified || !!email;
      const lowerEmail = email.toLowerCase();
      
      // Shinerva's Anti-Clone Protection: Block disposable emails (skip for placeholder emails)
      if (!email.endsWith('@placeholder.shinerva.id')) {
        const disposableDomains = ['10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'sharklasers.com', 'mailinator.com'];
        const emailDomain = lowerEmail.split('@')[1];
        if (disposableDomains.includes(emailDomain)) {
          console.warn(`[Security] Blocked signup attempt from disposable email: ${lowerEmail}`);
          return res.status(403).json({ error: 'Harap gunakan alamat email asli (Gmail/Outlook/Yahoo dsb).' });
        }
      }

      // Migration: If not found by UID, try finding by email
      if (!user) {
        console.log(`[Auth] User ${lowerEmail} not found by UID ${uid}, searching by email...`);
        user = await findUserByEmail(email);
        if (user) {
          console.log(`[Auth] Migrating user ${lowerEmail} from old ID ${user.id} to Firebase UID ${uid}`);
          const oldId = user.id;
          user.id = uid;
          user.email = email;
          await saveUser(uid, user);
          // If we had a delete function we'd delete the old doc, but UIDs should be unique
        }
      }

      // If still not found, it's a completely new Firebase user
      if (!user) {
        const refCode = req.headers['x-ref-code'] || '';
        let referredBy = null;
        if (refCode && dbAdmin) {
          const refSnapshot = await dbAdmin.collection('users').where('referral_code', '==', refCode).limit(1).get();
          if (!refSnapshot.empty) {
            referredBy = refSnapshot.docs[0].id;
          }
        }

        user = {
          id: uid,
          name: decodedToken.name || (email.includes('@') ? email.split('@')[0] : uid),
          email: email,
          emailVerified: currentEmailVerified,
          password: 'firebase-managed',
          whatsapp: '',
          whatsapp_opted_in: false,
          email_subscribed: true,
          tier: 'FREE',
          signup_date: Date.now(),
          last_generation_at: 0,
          referral_code: generateRefCode(),
          referred_by: referredBy,
          valid_referrals: 0,
          has_received_referral_bonus: false,
          social_bonus_status: 'none',
          social_url: '',
          signup_bonus_chars: 0, 
          monthly_chars: 10000,     
          earned_chars: referredBy ? 5000 : 0,
          used_chars: 0,
          generation_count: 0,
          pronunciations: {},
          history: []
        };
        await saveUser(uid, user);
        console.log(`[Server] New user created via Firebase: ${email} (${uid}), Verified: ${currentEmailVerified}`);
      } else {
        // Sync emailVerified for existing users
        if (user.emailVerified !== currentEmailVerified) {
          user.emailVerified = currentEmailVerified;
          console.log(`[Server] User ${email} emailVerified updated to ${currentEmailVerified}`);
          await saveUser(uid, { emailVerified: currentEmailVerified });
        }
      }

      // Admin Privilege Auto-Grant: Ensure hello.shinerva@gmail.com is ALWAYS an admin
      if (lowerEmail === 'hello.shinerva@gmail.com' && user.tier !== 'ENTERPRISE') {
        console.log("[Auth] Granting Enterprise tier to verified admin email: hello.shinerva@gmail.com");
        user.tier = 'ENTERPRISE';
        user.monthly_chars = 1000000;
        await saveUser(uid, { tier: 'ENTERPRISE', monthly_chars: 1000000 });
      }

      // Subscription Expiration & Monthly Credits Reset Check
      const now = new Date();
      let userUpdated = false;
      const updates = {};

      if (user.subscription_expires_at && now.getTime() > user.subscription_expires_at) {
        console.log(`[Subscription] User ${user.email} subscription expired. Downgrading to FREE.`);
        user.tier = 'FREE';
        user.monthly_chars = 10000;
        user.subscription_expires_at = null;
        updates.tier = 'FREE';
        updates.monthly_chars = 10000;
        updates.subscription_expires_at = null;
        userUpdated = true;
      }

      // Normalize FREE users who previously had the 10k signup bonus
      if (user.tier === 'FREE' && user.signup_bonus_chars > 0) {
        user.signup_bonus_chars = 0;
        updates.signup_bonus_chars = 0;
        userUpdated = true;
        console.log(`[Server] Normalized signup_bonus_chars to 0 for FREE user ${user.email}`);
      }

      const lastCheck = user.last_reset_check ? new Date(user.last_reset_check) : new Date(user.signup_date);
      if (now.getMonth() !== lastCheck.getMonth() || now.getFullYear() !== lastCheck.getFullYear()) {
         // Reset monthly allowance based on current tier (after potential downgrade)
         const tierLimits = {
           'FREE': 10000,
           'STARTER': 50000,
           'KREATOR': 150000,
           'PRODUKTIF': 400000,
           'BISNIS': 1500000,
           'CREATOR': 200000,
           'PRO': 600000,
           'BUSINESS': 1500000,
           'ENTERPRISE': 5000000
         };
         user.monthly_chars = tierLimits[user.tier] || 10000;
         user.used_chars = 0; // Reset usage for new month
         user.last_reset_check = Date.now();
         updates.monthly_chars = user.monthly_chars;
         updates.used_chars = 0;
         updates.last_reset_check = user.last_reset_check;
         userUpdated = true;
         console.log(`[Server] Monthly credits reset for ${user.email} (${user.tier})`);
      }

      if (userUpdated) {
        await saveUser(uid, updates);
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error.message);
      console.error("FIREBASE ERROR", error);
      const status = error.code === 'auth/id-token-expired' ? 401 : 403;
      res.status(status).json({ error: 'Token invalid or expired', code: error.code });
    }
  };

  // --- API ROUTES ---
  
  // Login route is now just a verification/sync route for the client
  app.all('/api/auth/sync', authenticate, (req, res) => {
    console.log(`[API] /api/auth/sync (${req.method}) hit by ${req.user?.email}`);
    res.json({ success: true, user: req.user });
  });

  // Server-side magic link email route with SMTP→Gmail fallback
  // POST /api/auth/magic-link — generates Firebase Admin link + sends via nodemailer
  // Falls through to: if request doesn't match, continues to legacy route handlers below
  app.post('/api/auth/magic-link', async (req, res) => {
    // Lazy-import to avoid circular dependency and keep module tree clean
    const { default: magicLinkHandler } = await import('./api/auth/magic-link.js');
    return magicLinkHandler(req, res);
  });

  // Legacy manual auth routes are disabled in favor of Firebase Auth
  app.all('/api/auth/login', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));
  app.all('/api/auth/signup', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));
  app.all('/api/auth/otp/*', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Google Login.' }));
  app.all('/api/auth/google', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use client-side Firebase Google Auth.' }));

  // Isolated checkout route — ZERO dependency on AI/TTS/Gemini/R2
  // POST /api/checkout/midtrans — generates Midtrans Snap token, no AI keys needed
  app.post('/api/checkout/midtrans', async (req, res) => {
    try {
      const { default: checkoutHandler } = await import('./api/checkout/midtrans.js');
      return checkoutHandler(req, res);
    } catch (err) {
      console.error('[Server] checkout/midtrans route import failed:', err.message);
      return res.status(500).json({ error: 'Checkout route unavailable.' });
    }
  });

  app.get('/api/user/me', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    
    // Shinerva's Helper: Calculate total current balance
    const totalAvailable = (req.user.monthly_chars || 0) + (req.user.signup_bonus_chars || 0) + (req.user.earned_chars || 0);
    const currentCredits = Math.max(0, totalAvailable - (req.user.used_chars || 0));
    
    res.json({ 
      user: {
        ...req.user,
        current_credits: currentCredits
      } 
    });
  });

  app.get('/api/user/referrals', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({
      referral_code: req.user.referral_code,
      invite_count: 0,
      valid_referrals: req.user.valid_referrals,
      bonus_earned: 0,
      has_received_bonus: false
    });
  });

  app.get('/api/user/pronunciations', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ pronunciations: req.user.pronunciations || {} });
  });

  app.get('/api/user/history', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ history: req.user.history || [] });
  });

  app.get('/api/admin/voice-config', authenticate, (req, res) => {
    // Let all users see it, but only admin can change
    res.json(voiceConfig);
  });

  app.post('/api/admin/voice-config', authenticate, adminOnly, async (req, res) => {
    // Admin check moved to middleware
    const { tiers, limits } = req.body;
    if (tiers) {
      voiceConfig.tiers = { ...voiceConfig.tiers, ...tiers };
    }
    if (limits) {
      voiceConfig.limits = { ...voiceConfig.limits, ...limits };
    }
    
    if (tiers || limits) {
      if (dbAdmin) {
        try {
          await dbAdmin.collection('config').doc('voices').set(voiceConfig);
        } catch (err) {
          console.error("[Firestore] Error saving voice config:", err);
        }
      }
      res.json({ success: true, voiceConfig });
    } else {
      res.status(400).json({ error: 'Invalid config' });
    }
  });

  app.post('/api/user/pronunciations', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { word, pronunciation } = req.body;
    if (!word) return res.status(400).json({ error: 'Word is required' });
    
    if (!req.user.pronunciations) req.user.pronunciations = {};
    
    if (pronunciation === null) {
      delete req.user.pronunciations[word];
    } else {
      req.user.pronunciations[word] = pronunciation;
    }
    
    await saveUser(req.user.id, { pronunciations: req.user.pronunciations });
    res.json({ success: true, pronunciations: req.user.pronunciations });
  });

  app.post('/api/user/settings', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { whatsapp, whatsapp_opted_in, email_subscribed } = req.body;
    
    const updates = {};
    if (whatsapp !== undefined) { req.user.whatsapp = whatsapp; updates.whatsapp = whatsapp; }
    if (whatsapp_opted_in !== undefined) { req.user.whatsapp_opted_in = whatsapp_opted_in; updates.whatsapp_opted_in = whatsapp_opted_in; }
    if (email_subscribed !== undefined) { req.user.email_subscribed = email_subscribed; updates.email_subscribed = email_subscribed; }
    
    await saveUser(req.user.id, updates);
    res.json({ success: true, user: req.user });
  });

  // --- ADMIN EXPORTS ---
  app.get('/api/admin/export/email', authenticate, adminOnly, async (req, res) => {
    // Admin check moved to middleware
    if (!dbAdmin) return res.status(503).json({ error: 'Firestore unavailable' });

    const snapshot = await dbAdmin.collection('users').where('email_subscribed', '==', true).get();
    let csv = "Name,Email,Tier,Signup Date,Total Characters Used\n";
    snapshot.forEach(doc => {
      const u = doc.data();
      csv += `"${u.name}","${u.email}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('email_list.csv');
    res.send(csv);
  });

  // --- MIDTRANS CONFIG ---
  let cachedSnap = null;
  function getSnap() {
    if (!cachedSnap) {
      if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
        throw new Error('Midtrans API keys are not configured. Please set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in app settings.');
      }
      cachedSnap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });
    }
    return cachedSnap;
  }

  // --- PAYMENT ROUTES ---
  app.post('/api/payment/create', authenticate, async (req, res) => {
    const { planId } = req.body;
    const user = req.user;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID required' });
    }

    const key = planId.toUpperCase();
    const plan = PLANS[key];
    if (!plan) {
      return res.status(400).json({ error: 'Paket tidak valid' });
    }

    const price = plan.price;
    const orderId = `ORDER-${user.id}-${key}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.whatsapp
      },
      item_details: [{
        id: planId.toLowerCase(),
        price: price,
        quantity: 1,
        name: `Shinerva ${key} Subscription`
      }],
      metadata: {
        uid: user.id,
        plan_id: planId.toLowerCase(),
        billing_cycle: 'monthly'
      },
      enabled_payments: [
        "gopay", "shopeepay", "ovo", "dana", "linkaja", "qris", 
        "bca_va", "bni_va", "bri_va", "mandiri_va", "other_va"
      ],
      callbacks: {
        finish: `${req.protocol}://${req.get('host')}/settings`
      }
    };

    try {
      const snap = getSnap();
      const transaction = await snap.createTransaction(parameter);
      
      // Store payment record in pending/created status
      await dbAdmin.collection('payments').doc(orderId).set({
        transaction_id: null,
        user_id: user.id,
        plan: key,
        amount: price,
        status: 'pending',
        processed_at: null
      });

      console.log(`[Payment Created] Order: ${orderId} for User: ${user.id}, Plan: ${key}, Amount: ${price}`);
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (error) {
      console.error('Midtrans Error:', error);
      res.status(500).json({ error: error.message || 'Gagal membuat transaksi pembayaran' });
    }
  });

  app.post('/api/payment/webhook', async (req, res) => {
    const notification = req.body;
    
    // Shinerva's Security Measure: Verify Signature Key
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        console.error('[Midtrans Webhook] Missing MIDTRANS_SERVER_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      const snap = getSnap();
      const statusResponse = await snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      const grossAmount = statusResponse.gross_amount;
      const signatureKey = statusResponse.signature_key;
      const transactionId = statusResponse.transaction_id;

      console.log(`[Midtrans Webhook] Verified Notification received. Order ID: ${orderId}. Status: ${transactionStatus}, ID: ${transactionId}`);

      // 1. Validate signature key
      const calculatedSignature = crypto.createHash('sha512')
        .update(orderId + statusResponse.status_code + grossAmount + serverKey)
        .digest('hex');

      if (calculatedSignature !== signatureKey) {
        console.error(`[Security Warning] Invalid signature key for Order ID: ${orderId}`);
        return res.status(403).json({ error: 'Invalid signature key' });
      }

      // 2. Validate transaction status
      const validStatuses = ['settlement', 'capture', 'pending', 'expire', 'cancel', 'deny'];
      if (!validStatuses.includes(transactionStatus)) {
        console.warn(`[Midtrans Webhook] Received unknown transaction status: ${transactionStatus}`);
      }

      // 3. Lookup stored transaction data
      const paymentRef = dbAdmin.collection('payments').doc(orderId);
      const paymentDoc = await paymentRef.get();
      if (!paymentDoc.exists) {
        console.error(`[Security Warning] No pending payment record found for Order ID: ${orderId}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      const paymentData = paymentDoc.data();

      // 4. Validate gross amount
      if (Math.round(parseFloat(grossAmount)) !== paymentData.amount) {
        console.error(`[Security Warning] Gross amount mismatch for Order ID: ${orderId}. Expected: ${paymentData.amount}, Received: ${grossAmount}`);
        return res.status(400).json({ error: 'Gross amount mismatch' });
      }

      // 5. Add idempotency check
      // Check if transaction_id is already completed
      if (paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.transaction_id === transactionId) {
        console.log(`[Midtrans Webhook] Order ${orderId} (Tx: ${transactionId}) already processed/completed. Returning success (idempotent).`);
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // 6. Handle transaction status
      if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus !== 'challenge')) {
        const uid = paymentData.user_id;
        const plan = paymentData.plan;
        const planDetails = PLANS[plan];

        if (!planDetails) {
          console.error(`[Midtrans Webhook] Plan configuration not found for: ${plan}`);
          return res.status(500).json({ error: 'Plan configuration error' });
        }

        console.log(`[Midtrans Webhook] Successful payment for Order ID: ${orderId}. Granting credits to User ID: ${uid}. Plan: ${plan}`);

        // Perform user & payment record atomic update via Firestore batch
        const batch = dbAdmin.batch();
        
        const userRef = dbAdmin.collection('users').doc(uid);
        batch.set(userRef, {
          tier: plan,
          monthly_chars: planDetails.chars,
          used_chars: 0,
          subscription_expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000),
          last_payment_at: Date.now(),
          last_order_id: orderId
        }, { merge: true });

        batch.update(paymentRef, {
          transaction_id: transactionId,
          status: transactionStatus,
          processed_at: Date.now()
        });

        await batch.commit();
        console.log(`[Payment SUCCESS] Credits/Tier updated for user ${uid} from Order ${orderId}`);
      } else {
        // Just update status of payment record
        await paymentRef.update({
          transaction_id: transactionId || null,
          status: transactionStatus,
          processed_at: Date.now()
        });
        console.log(`[Midtrans Webhook] Order ${orderId} status updated to: ${transactionStatus}`);
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('[Midtrans Webhook] Error:', error);
      return res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/admin/export/whatsapp', authenticate, adminOnly, async (req, res) => {
    // Admin check moved to middleware
    if (!dbAdmin) return res.status(503).json({ error: 'Firestore unavailable' });

    const snapshot = await dbAdmin.collection('users').where('whatsapp_opted_in', '==', true).get();
    let csv = "Name,WhatsApp,Tier,Signup Date,Total Characters Used\n";
    snapshot.forEach(doc => {
      const u = doc.data();
      if (u.whatsapp) {
        csv += `"${u.name}","${u.whatsapp}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
      }
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('whatsapp_list.csv');
    res.send(csv);
  });
  
  // --- RATE LIMITERS ---
  // In-memory active request tracking moved to rateLimiterStore
  const getClientIp = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const TIER_LIMITS = {
    'FREE': { requests: 2, simultaneous: 1 },
    'STARTER': { requests: 10, simultaneous: 2 },
    'KREATOR': { requests: 10, simultaneous: 2 },
    'PRODUKTIF': { requests: 30, simultaneous: 5 },
    'BISNIS': { requests: 30, simultaneous: 5 },
    'CREATOR': { requests: 10, simultaneous: 2 },
    'PRO': { requests: 30, simultaneous: 5 },
    'BUSINESS': { requests: 30, simultaneous: 5 },
    'ENTERPRISE': { requests: 30, simultaneous: 5 },
  };

  const ttsRateLimiterMiddleware = rateLimit({
    windowMs: 60 * 1000,
    max: (req) => {
      if (req.body && req.body.isSample === true) return 5;
      const tier = req.user ? req.user.tier : 'FREE';
      return TIER_LIMITS[tier]?.requests || 2;
    },
    keyGenerator: (req) => req.user ? req.user.id : getClientIp(req),
    message: { error: 'Batas request per menit tercapai. Silakan coba lagi beberapa saat lagi.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const cooldownLimiter = (req, res, next) => {
    if (req.body && req.body.isSample) return next();
    const user = req.user;
    if (!user) return next();
    
    const now = Date.now();
    const tier = user.tier;
    const cooldownSec = tier === 'FREE' ? voiceConfig.limits.free_cooldown_sec : voiceConfig.limits.paid_cooldown_sec;
    const cooldownMs = cooldownSec * 1000;
    const timeSinceLast = now - (user.last_generation_at || 0);
    if (timeSinceLast < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - timeSinceLast) / 1000);
      return res.status(429).json({ 
        error: `Cooldown aktif. Silakan tunggu ${remaining} detik lagi.`,
        cooldownRemaining: remaining
      });
    }
    next();
  };

  const dailyLimitLimiter = (req, res, next) => {
    if (req.body && req.body.isSample) return next();
    const user = req.user;
    if (user && user.tier === 'FREE' && user.generation_count >= 20) {
       return res.status(429).json({ error: 'Batas 20 generasi harian untuk paket FREE telah tercapai. Nikmati tak terbatas dengan paket STARTER hanya Rp19rb!' });
    }
    next();
  };

  const concurrencyLimiter = (req, res, next) => {
    if (req.body && req.body.isSample) return next();
    const user = req.user;
    const tier = user ? user.tier : 'FREE';
    const clientId = user ? user.id : getClientIp(req);
    const maxSimultaneous = TIER_LIMITS[tier]?.simultaneous || 1;

    const activeCount = getActiveCount(clientId);
    if (activeCount >= maxSimultaneous) {
      return res.status(429).json({ error: 'Terlalu banyak antrean proses bersamaan. Harap tunggu proses sebelumnya selesai.' });
    }

    increment(clientId);

    const decrementActive = () => {
      const currentActive = getActiveCount(clientId) || 1;
      decrement(clientId);
    };

    res.on('finish', decrementActive);
    res.on('close', () => {
      if (!res.writableEnded) decrementActive();
    });

    next();
  };

  const hourlyFreeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: (req) => (req.user && req.user.tier === 'FREE' ? 3 : 1000),
    keyGenerator: (req) => req.user ? req.user.id : getClientIp(req),
    message: { error: 'Batas 3 generasi per jam untuk paket FREE tercapai. Upgrade untuk akses tak terbatas!' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const dailyFreeLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: (req) => (req.user && req.user.tier === 'FREE' ? 10 : 5000),
    keyGenerator: (req) => req.user ? req.user.id : getClientIp(req),
    message: { error: 'Batas 10 generasi per hari untuk paket FREE tercapai. Nikmati tak terbatas dengan paket STARTER hanya Rp19rb!' },
    standardHeaders: true,
    legacyHeaders: false,
  });


  // --- TTS GENERATION ---
  const handleTtsRequest = async (req, res) => {
    console.log(`[TTS Handler] Method: ${req.method} Path: ${req.url} Body:`, { ...req.body, text: req.body?.text?.slice(0, 20) + '...' });
    try {
      let { text, voice, speed, pitch, volume, isSample } = req.body;
      const apiKey = clean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_FIREBASE_API_KEY);
      
      let tokenStr = "";
      try {
        const authClient = getGoogleAuthClient();
        if (authClient) {
          const client = await authClient.getClient();
          const tokenObj = await client.getAccessToken();
          tokenStr = tokenObj.token;
        }
      } catch(err) {
        console.error("GoogleAuth Error:", err);
      }
      let user = req.user;
      const isGeminiVoice = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoife', 'Eos'].includes(voice);

      if (!user) {
        if (isSample) {
          // Allow limited guest access for samples
          user = { 
            id: 'guest', 
            tier: 'FREE', 
            monthly_chars: 0, 
            signup_bonus_chars: 0, 
            earned_chars: 0, 
            used_chars: 0, 
            generation_count: 0,
            pronunciations: {} 
          };
        } else {
          return res.status(401).json({ error: 'Harap masuk (login) untuk menggunakan layanan TTS.' });
        }
      }

      if (isSample) {
        // Allow custom text for samples but limit length to avoid abuse
        if (text && text.length > 500) {
          return res.status(400).json({ error: "Sample text is too long (max 500 chars)." });
        }
        if (!text) {
          text = "Halo, ini adalah contoh suara saya yang jernih dan natural di Shinerva. Suara ini menggunakan teknologi kecerdasan buatan terbaru untuk menghasilkan pengucapan yang sangat mirip dengan manusia asli.";
        }
      }

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Teks diperlukan untuk konversi suara.' });
      }

      if (!apiKey && !tokenStr) {
        console.error('[TTS Configuration Error] Missing API Key or Service Account credentials.');
        return res.status(503).json({ error: 'Layanan TTS sedang dalam pemeliharaan (Konfigurasi API tidak ditemukan).' });
      }

      const tier = user.tier || 'FREE';
      
      const maxChars = isSample ? 500 : (tier === 'FREE' ? voiceConfig.limits.free_request_chars : voiceConfig.limits.paid_request_chars);
      if (text.length > maxChars) {
        return res.status(400).json({ error: `Teks terlalu panjang (maksimal ${maxChars} karakter untuk tier ini).` });
      }
      
      // Voice Authorization - STABLE VOICE ROUTING
      let actualVoice = voice || 'SAMBAS';
      
      // Multiplier logic
      let voiceTierName = 'Standard';

      const multiplier = voiceConfig.tiers[voiceTierName] || 1;
      const totalCharCost = isSample ? 0 : text.length * multiplier;

      const totalAvailable = (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0);
      let remaining = totalAvailable - (user.used_chars || 0);

      if (!isSample && totalCharCost > remaining) {
        return res.status(402).json({ error: 'Kredit karakter tidak mencukupi (Membutuhkan ' + totalCharCost + ' kredit).' });
      }

      // Shinerva Engine logic
      const modifiedText = applyPhoneticMoat(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      // Interpret Expressive Prosody Cues for Gemini Audio
      const expressiveText = modifiedText
        .replace(/\[semangat\]/gi, '[enthusiasm]')
        .replace(/\[\/semangat\]/gi, '')
        .replace(/\[sedih\]/gi, '[sadness]')
        .replace(/\[\/sedih\]/gi, '')
        .replace(/\[serius\]/gi, '[serious]')
        .replace(/\[\/serius\]/gi, '')
        .replace(/\[bisik\]/gi, '[whispers]')
        .replace(/\[\/bisik\]/gi, '')
        .replace(/\[teriak\]/gi, '[shouting]')
        .replace(/\[\/teriak\]/gi, '');

      // Pronunciation Global Dictionary
      const globalPhonetics = { "AI": "ey ay", "IT": "ay ti", "Shinerva": "shi ner va" };
      const allPronunciations = { ...globalPhonetics, ...(user.pronunciations || {}) };
      
      let processedText = expressiveText;
      Object.entries(allPronunciations).forEach(([word, pron]) => {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
        processedText = processedText.replace(regex, pron);
      });

      const finalProcessedText = (processedText || "").trim() || "Halo.";
      const watermark = tier === 'FREE' ? ' [short pause] Suara ini dibuat oleh Shinerva Engine by Shinerva dot ey ay.' : '';
      const promptText = finalProcessedText + watermark;
      
      console.log(`[Gemini TTS] Requesting preset: ${actualVoice}. Text Length: ${promptText.length}`);
      
      const hashData = `${promptText}|${actualVoice}|${speed || 1.0}|${pitch || 0.0}|${volume || 0.0}`;
      const cacheHash = crypto.createHash('sha256').update(hashData).digest('hex');
      const cacheFilename = `audio_${cacheHash}.wav`;
      
      let finalAudioContent = null;
      let finalAudioUrl = null;
      let finalAudioMimeType = 'audio/mpeg';

      const isCached = await checkAudioCache(cacheFilename);

      if (isCached) {
        finalAudioUrl = getAudioPublicUrl(cacheFilename);
        finalAudioMimeType = 'audio/wav';
        console.log(`[Gemini TTS] Cache hit for ${cacheFilename}. Returning R2 URL.`);
      } else {
        console.log(`[Gemini TTS] Generating audio for preset ${actualVoice}...`);
        finalAudioContent = await generateGeminiTts(promptText, actualVoice);
        if (finalAudioContent) {
          finalAudioMimeType = 'audio/wav';
          console.log(`[Gemini TTS] Success.`);
        }

        if (finalAudioContent) {
          console.log(`[TTS] Uploading to R2...`);
          try {
            finalAudioUrl = await uploadAudioToR2(cacheFilename, finalAudioContent);
            finalAudioContent = undefined;
          } catch (r2Err) {
            console.error(`[R2 Storage] Upload failed, falling back to base64:`, r2Err.message);
          }
        }
      }

      if (!isSample) {
        // Atomic credit deduction and generation event logging
        const generationId = generateId();
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        try {
          await deductCredits({
            uid: req.user.id,
            charCost: totalCharCost,
            generationId,
            ip: clientIp,
            model: 'gemini',
            // Token counts are not tracked here; placeholders
            promptTokens: null,
            completionTokens: null
          });
        } catch (e) {
          console.error('Credit deduction failed:', e.message);
          return res.status(400).json({ error: e.message });
        }
        // Update user history locally (credits already updated in DB)
        if (!user.history) user.history = [];
        user.history.unshift({
          id: generationId,
          date: Date.now(),
          text_length: text.length,
          voice: actualVoice,
          tier: tier,
          duration: Math.round(text.length / 15),
          credits_used: totalCharCost,
          audioUrl: finalAudioUrl
        });

        // Save history (credits already deducted by deductCredits above)
        await saveUser(req.user.id, { history: user.history });
      }

      const audioSize = finalAudioContent ? finalAudioContent.length : 0;
      const audioSizeKB = (audioSize * 0.75 / 1024).toFixed(1);
      console.log(`[TTS] Response: method=${finalAudioMimeType === 'audio/wav' ? 'Gemini' : 'Google Cloud TTS'} mime=${finalAudioMimeType} size=${audioSize}chars(~${audioSizeKB}KB) hasUrl=${!!finalAudioUrl}`);
      if (finalAudioContent && audioSize < 100) {
        console.error(`[TTS] Audio content too small (${audioSize} chars), likely invalid!`);
      }

      // DIAGNOSTIC: Log what we're about to return
      console.log(`[TTS] Final response: audioUrl=${finalAudioUrl ? 'SET' : 'NULL'}, audioContent=${finalAudioContent ? 'SET' : 'NULL'}, mimeType=${finalAudioMimeType}`);

      res.json({
        // DIAGNOSTICS - helps debug what's actually being returned
        _debug: {
          r2Configured: !!(process.env.R2_ACCOUNT_ID && process.env.R2_SECRET_ACCESS_KEY),
          r2Bucket: process.env.R2_BUCKET_NAME || null,
          r2PublicDomain: process.env.R2_PUBLIC_DOMAIN || null,
          geminiConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
          geminiApiKeyPrefix: (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').substring(0, 10) + '...',
          audioUrl: finalAudioUrl,
          audioContentSize: finalAudioContent ? finalAudioContent.length : 0,
          audioMimeType: finalAudioMimeType,
          isCached: !!finalAudioUrl && !finalAudioContent
        },
        // Standard response
        audioContent: finalAudioContent,
        audioUrl: finalAudioUrl,
        audioMimeType: finalAudioMimeType,
        voice: actualVoice,
        duration: Math.round(text.length / 15),
        used_chars: user.used_chars,
        remaining_credits: Math.max(0, (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0) - (user.used_chars || 0))
      });
    } catch (error) {
      console.error('TTS error details:', {
        message: error.message,
        stack: error.stack,
        isSample: req.body?.isSample,
        voice: req.body?.voice
      });
      res.status(500).json({
        error: error.message,
        detail: isProd ? undefined : error.stack,
        code: 'TTS_FAILED',
        // DIAGNOSTICS on error
        _debug: {
          geminiConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
          r2Configured: !!(process.env.R2_ACCOUNT_ID && process.env.R2_SECRET_ACCESS_KEY)
        }
      });
    }
  };

  // --- DEBUG & HEALTH ---
  app.get("/api/auth/diag", (req, res) => {
    const diag = {
      firebaseAdminInitialized: !!authAdmin,
      initError: initErrorMsg || (!authAdmin ? "Backend initialization incomplete or credentials missing." : null),
      projectId: process.env.FIREBASE_PROJECT_ID || "(missing)",
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasEmailHost: !!process.env.EMAIL_HOST,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasFallbackEmail: !!process.env.FALLBACK_EMAIL,
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    console.log("[Diag] Auth diagnostics requested:", diag);
    res.json(diag);
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      origin: req.headers.origin || "unknown",
      host: req.headers.host,
      firebaseAdmin: !!authAdmin,
      projectId: process.env.FIREBASE_PROJECT_ID,
      isCorrectProject: process.env.FIREBASE_PROJECT_ID === "practical-gecko-476621-q4",
      hasClientConfig: fs.existsSync(path.resolve(process.cwd(), 'firebase-applet-config.json'))
    });
  });

  app.get("/api/user/debug-credits", async (req, res) => {
    const email = (req.query.email || '').toLowerCase().trim();
    try {
      if (email) {
        const snapshot = await dbAdmin.collection('users').where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
          const all = await dbAdmin.collection('users').limit(5).get();
          const allUsers = all.docs.map(d => ({ id: d.id, email: d.data().email, used_chars: d.data().used_chars }));
          return res.json({ error: 'User not found in Firestore', email, all_users: allUsers });
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        return res.json({
          uid: doc.id,
          email: data.email,
          firestore_used_chars: data.used_chars,
          firestore_user: {
            used_chars: data.used_chars,
            monthly_chars: data.monthly_chars,
            signup_bonus_chars: data.signup_bonus_chars,
            earned_chars: data.earned_chars,
            generation_count: data.generation_count,
            tier: data.tier,
            last_reset_check: data.last_reset_check
          }
        });
      }
      const all = await dbAdmin.collection('users').limit(5).get();
      res.json({ all_users: all.docs.map(d => ({ id: d.id, email: d.data().email, used_chars: d.data().used_chars })) });
    } catch (e) {
      res.json({ error: e.message, dbAdmin_exists: !!dbAdmin });
    }
  });

  app.get("/api/debug-env", (req, res) => {
    res.json({
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.VITE_FIREBASE_API_KEY,
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.VITE_FIREBASE_API_KEY ? process.env.VITE_FIREBASE_API_KEY.slice(0, 6) : "(none)",
      nodeEnv: process.env.NODE_ENV
    });
  });

  app.post(['/api/tts', '/api/tts/'], authenticate, hourlyFreeLimiter, dailyFreeLimiter, cooldownLimiter, dailyLimitLimiter, ttsRateLimiterMiddleware, concurrencyLimiter, handleTtsRequest);
  const sampleRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: getClientIp,
    message: { error: 'Terlalu banyak permintaan sampel suara. Silakan coba lagi nanti atau buat akun.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post('/api/tts/sample', verifyTurnstile, sampleRateLimiter, (req, res, next) => { req.body.isSample = true; next(); }, ttsRateLimiterMiddleware, handleTtsRequest);
  app.post(['/api/generate-voice', '/api/generate-voice/'], authenticate, hourlyFreeLimiter, dailyFreeLimiter, cooldownLimiter, dailyLimitLimiter, ttsRateLimiterMiddleware, concurrencyLimiter, handleTtsRequest);

  // --- FINAL API SAFETY NET ---
  // Catch-all 404 for API routes to distinguish from frontend 404
  app.all('/api/*', (req, res) => {
    console.warn(`[404] API Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: `API Endpoint ${req.method} ${req.originalUrl} tidak ditemukan di server Shinerva.`,
      availableEndpoints: ['/api/tts', '/api/user/me', '/api/auth/sync', '/api/health', '/api/auth/diag']
    });
  });

  // --- VITE FRONTEND SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.error(e.stack);
        res.status(500).end(e.stack);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.url.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

let app;
const appPromise = createServer();

appPromise.then(resolvedApp => {
  app = resolvedApp;
  const isMain = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
  if (isMain) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Listening on http://0.0.0.0:${PORT} (Express, API, and Frontend ready)`);
    });
  }
}).catch(err => {
  console.error("CRITICAL: Server failed to start:", err);
  process.exit(1);
});

export default appPromise;
