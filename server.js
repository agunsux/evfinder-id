import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const firebaseConfig = require('./firebase-applet-config.json');

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

admin.initializeApp({
  projectId: firebaseConfig.projectId
});

const db = admin.firestore();
// Use the database ID if specified in config
if (firebaseConfig.firestoreDatabaseId) {
  // Note: Standard firebase-admin doesn't easily support databaseId in initializeApp 
  // but we can request it via the firestore instance if needed.
  // Actually, for AI Studio, the default instance usually works if project is correctly provisioned.
}

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// --- FIRESTORE COLLECTIONS ---
const usersCol = db.collection('users');
const configCol = db.collection('config');

// Temporary in-memory OTPs removed as login is now email-only via Firebase Auth.

let voiceConfig = {
  tiers: {
    'Standard': 1,
    'Wavenet': 1,
    'Neural2': 4,
    'Studio': 40,
    'Chirp': 8
  },
  limits: {
    free_request_chars: 500,
    paid_request_chars: 5000,
    free_cooldown_sec: 15,
    paid_cooldown_sec: 2
  }
};

async function loadVoiceConfig() {
  const doc = await configCol.doc('voice').get();
  if (doc.exists) {
    voiceConfig = doc.data();
  }
}
loadVoiceConfig();

async function saveVoiceConfig() {
  await configCol.doc('voice').set(voiceConfig);
}

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}
function generateRefCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail(toEmail, userName) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL_SKIPPED] To: ${toEmail}. SMTP credentials not configured.`);
    return;
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Shinerva AI'}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Selamat Datang di Shinerva AI!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
        <h2 style="color: #E2725B;">Halo, ${userName}!</h2>
        <p>Terima kasih telah bergabung dengan <strong>Shinerva AI</strong>, platform Text-to-Speech terbaik untuk konten kreator Indonesia.</p>
        <p>Akun Anda telah berhasil dibuat. Sebagai hadiah sambutan, kami telah menambahkan <strong>5.000 karakter gratis</strong> ke akun Anda untuk mulai berkreasi.</p>
        <div style="background: #fdf2f0; padding: 15px; border-left: 4px solid #E2725B; margin: 20px 0;">
          <p style="margin: 0;"><strong>Tips Memulai:</strong></p>
          <ul style="margin: 10px 0 0 0;">
            <li>Gunakan suara <strong>Neural2</strong> untuk hasil yang lebih alami.</li>
            <li>Manfaatkan fitur <strong>Kamus Pengucapan</strong> untuk kata-kata serapan.</li>
            <li>Coba suara <strong>Studio</strong> untuk kualitas iklan premium.</li>
          </ul>
        </div>
        <a href="https://shinerva.id" style="display: inline-block; background: #E2725B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Buka Dashboard</a>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          Jika Anda tidak merasa mendaftar di Shinerva, silakan abaikan email ini.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL_SENT] Success! Message ID: ${info.messageId} to ${toEmail}`);
  } catch (error) {
    console.error(`[EMAIL_ERROR] Failed to send email to ${toEmail}:`, error);
  }
}

// Ensure an admin user exists for exports
async function bootstrapAdmin() {
  const adminRef = usersCol.doc('admin');
  const adminDoc = await adminRef.get();
  if (!adminDoc.exists) {
    await adminRef.set({
      id: 'admin', 
      name: 'Admin', 
      email: 'admin@shinerva.id', 
      tier: 'ENTERPRISE', 
      valid_referrals: 0, 
      has_received_referral_bonus: false, 
      signup_bonus_chars: 10000, 
      monthly_chars: 1000000, 
      earned_chars: 0, 
      used_chars: 0, 
      generation_count: 0, 
      email_subscribed: true, 
      whatsapp_opted_in: false, 
      history: []
    });
  }
}
bootstrapAdmin();

// --- WHATSAPP SETUP ---
async function sendWhatsAppOTP(phone, otp) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const apiUrl = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';

  if (!token) {
    console.log(`[WHATSAPP_SKIPPED] To: ${phone} | OTP: ${otp}. WHATSAPP_API_TOKEN not configured.`);
    return { success: false, message: 'WhatsApp API Token not configured' };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: new URLSearchParams({
        target: phone,
        message: `*KODE OTP SHINERVA*\n\nKode: *${otp}*\n\nJangan bagikan kode ini kepada siapapun. Kode berlaku selama 5 menit.`,
      })
    });

    const result = await response.json();
    if (result.status) {
      console.log(`[WHATSAPP_SENT] Success! Phone: ${phone}`);
      return { success: true };
    } else {
      console.error(`[WHATSAPP_ERROR] API returned error for ${phone}:`, result.reason || result.message);
      return { success: false, message: result.reason || result.message };
    }
  } catch (error) {
    console.error(`[WHATSAPP_ERROR] Failed to send to ${phone}:`, error);
    return { success: false, message: 'Failed to connect to WhatsApp API' };
  }
}

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- AUTH MIDDLEWARE ---
  const authenticate = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    const emailHeader = req.headers['x-user-email'];
    
    if (idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userDoc = await usersCol.doc(decodedToken.uid).get();
        if (userDoc.exists) {
          req.user = userDoc.data();
          return next();
        }
      } catch (error) {
        console.error("Auth token verification failed:", error);
      }
    } else if (emailHeader) {
      // Legacy / Fallback for development if not using tokens yet
      const snapshot = await usersCol.where('email', '==', emailHeader).limit(1).get();
      if (!snapshot.empty) {
        req.user = snapshot.docs[0].data();
        return next();
      }
    }
    
    next();
  };

  // --- API ROUTES ---
  
  app.post('/api/auth/sync', async (req, res) => {
    const { uid, email, name, whatsapp, refCode } = req.body;
    if (!uid || !email) return res.status(400).json({ error: 'Missing uid or email' });

    const userRef = usersCol.doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      let referredBy = null;
      if (refCode) {
        const refSnapshot = await usersCol.where('referral_code', '==', refCode).limit(1).get();
        if (!refSnapshot.empty) {
          referredBy = refSnapshot.docs[0].id;
        }
      }

      const newUser = {
        id: uid,
        name: name || '',
        email,
        whatsapp: whatsapp || '',
        whatsapp_opted_in: !!whatsapp,
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
        signup_bonus_chars: 5000,
        monthly_chars: 0, 
        earned_chars: 0,
        used_chars: 0,
        generation_count: 0,
        pronunciations: {},
        history: [] // Keep for now, but should move to subcollection
      };
      
      await userRef.set(newUser);
      sendWelcomeEmail(email, name || email);
      return res.json({ success: true, user: newUser });
    }

    res.json({ success: true, user: userDoc.data() });
  });

  app.get('/api/user/me', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.user });
  });

  app.get('/api/user/pronunciations', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ pronunciations: req.user.pronunciations || {} });
  });

  app.get('/api/user/history', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ history: req.user.history || [] });
  });

  app.get('/api/admin/voice-config', authenticate, async (req, res) => {
    // Let all users see it, but only admin can change
    res.json(voiceConfig);
  });

  app.post('/api/admin/voice-config', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const { tiers, limits } = req.body;
    if (tiers) {
      voiceConfig.tiers = { ...voiceConfig.tiers, ...tiers };
    }
    if (limits) {
      voiceConfig.limits = { ...voiceConfig.limits, ...limits };
    }
    
    if (tiers || limits) {
      await saveVoiceConfig();
      res.json({ success: true, voiceConfig });
    } else {
      res.status(400).json({ error: 'Invalid config' });
    }
  });

  app.post('/api/admin/test-email', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Target email is required' });
    
    await sendWelcomeEmail(email, 'Test User');
    res.json({ success: true, message: 'Test email sent. Check server logs for details.' });
  });

  app.post('/api/admin/test-whatsapp', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Target phone number is required' });
    
    const result = await sendWhatsAppOTP(phone, '1234');
    if (result.success) {
      res.json({ success: true, message: 'Test WhatsApp message sent successfully!' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send WhatsApp: ' + result.message });
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
    
    await usersCol.doc(req.user.id).update({ pronunciations: req.user.pronunciations });
    res.json({ success: true, pronunciations: req.user.pronunciations });
  });

  app.post('/api/user/social-share', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { url } = req.body;
    if (req.user.social_bonus_status !== 'none') {
      return res.status(400).json({ error: 'Sudah pernah mengklaim bonus ini.' });
    }
    req.user.social_bonus_status = 'pending';
    req.user.social_url = url;
    await usersCol.doc(req.user.id).update({ 
      social_bonus_status: 'pending',
      social_url: url
    });
    res.json({ success: true, message: 'Pengajuan berhasil. Menunggu verifikasi admin.', user: req.user });
  });

  app.post('/api/user/settings', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { whatsapp, whatsapp_opted_in, email_subscribed } = req.body;
    const updates = {};
    if (whatsapp !== undefined) updates.whatsapp = req.user.whatsapp = whatsapp;
    if (whatsapp_opted_in !== undefined) updates.whatsapp_opted_in = req.user.whatsapp_opted_in = whatsapp_opted_in;
    if (email_subscribed !== undefined) updates.email_subscribed = req.user.email_subscribed = email_subscribed;
    
    await usersCol.doc(req.user.id).update(updates);
    res.json({ success: true, user: req.user });
  });

  // --- ADMIN EXPORTS ---
  app.get('/api/admin/export/email', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    let csv = "Name,Email,Tier,Signup Date,Total Characters Used\n";
    const snapshot = await usersCol.where('email_subscribed', '==', true).get();
    snapshot.forEach(doc => {
      const u = doc.data();
      csv += `"${u.name}","${u.email}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('email_list.csv');
    res.send(csv);
  });

  app.get('/api/admin/export/whatsapp', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    let csv = "Name,WhatsApp,Tier,Signup Date,Total Characters Used\n";
    const snapshot = await usersCol.where('whatsapp_opted_in', '==', true).get();
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
  
  app.post('/api/admin/social-approvals/:id/approve', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const targetId = req.params.id;
    const userRef = usersCol.doc(targetId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({error: 'User not found'});
    const targetUser = userDoc.data();

    if (targetUser.social_bonus_status === 'pending') {
       await userRef.update({
         social_bonus_status: 'approved',
         earned_chars: admin.firestore.FieldValue.increment(30000)
       });
       res.json({ success: true });
    } else {
       res.status(400).json({ error: 'Status is not pending' });
    }
  });


  // --- RATE LIMITER & CONCURRENCY ---
  const rateLimitStore = new Map();
  const activeRequests = new Map();

  const getClientIp = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const ttsRateLimiter = (req, res, next) => {
    const user = req.user;
    const tier = user ? user.tier : 'FREE';
    const clientId = user ? user.id : getClientIp(req);
    const now = Date.now();
    
    // IP Logging for abuse detection
    const ip = getClientIp(req);
    console.log(`[TTS_REQUEST] User: ${user?.email || 'GUEST'} | IP: ${ip} | Tier: ${tier}`);

    // Cooldown check
    if (user) {
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
    }

    let maxRequestsPerMinute = 3;
    let maxSimultaneous = 1;

    if (tier === 'FREE') {
      maxRequestsPerMinute = 2; // Strict for free
    } else if (tier === 'STARTER' || tier === 'KREATOR') {
      maxRequestsPerMinute = 10;
      maxSimultaneous = 2;
    } else if (tier === 'PRODUKTIF' || tier === 'BISNIS' || tier === 'ENTERPRISE') {
      maxRequestsPerMinute = 30; 
      maxSimultaneous = 5;
    }

    const windowMs = 60 * 1000; // 1 min

    // Concurrency Check
    const activeCount = activeRequests.get(clientId) || 0;
    if (activeCount >= maxSimultaneous) {
      return res.status(429).json({ error: 'Terlalu banyak antrean proses bersamaan. Harap tunggu proses sebelumnya selesai.' });
    }

    // Rate Limit Check
    let userStats = rateLimitStore.get(clientId);
    if (!userStats || now - userStats.windowStart > windowMs) {
      userStats = { windowStart: now, count: 0 };
    }

    if (userStats.count >= maxRequestsPerMinute) {
      return res.status(429).json({ error: 'Batas request per menit tercapai. Silakan coba lagi beberapa saat lagi.' });
    }

    // Daily Check for FREE
    if (tier === 'FREE' && user && user.generation_count >= 20) {
       return res.status(429).json({ error: 'Batas 20 generasi harian untuk paket FREE telah tercapai. Nikmati tak terbatas dengan paket STARTER hanya Rp19rb!' });
    }

    userStats.count += 1;
    rateLimitStore.set(clientId, userStats);
    activeRequests.set(clientId, activeCount + 1);

    const decrementActive = () => {
      const currentActive = activeRequests.get(clientId) || 1;
      activeRequests.set(clientId, Math.max(0, currentActive - 1));
    };

    res.on('finish', decrementActive);
    res.on('close', () => {
      if (!res.writableEnded) decrementActive();
    });

    next();
  };

  app.post('/api/tts', authenticate, ttsRateLimiter, async (req, res) => {
    try {
      const { text, voice, speed, pitch, volume } = req.body;
      const apiKey = process.env.GOOGLE_API_KEY;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Harap masuk (login) untuk menggunakan layanan TTS.' });
      }

      if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY') {
        return res.status(401).json({ error: 'Missing GOOGLE_API_KEY in .env' });
      }

      // Tier Specific Constraints
      const tier = user.tier;
      const maxRequestChars = tier === 'FREE' ? voiceConfig.limits.free_request_chars : voiceConfig.limits.paid_request_chars;
      
      if (text.length > maxRequestChars) {
        return res.status(400).json({ error: `Batas karakter per request untuk paket Anda adalah ${maxRequestChars}. Upgrade untuk limit lebih besar.` });
      }

      // Check Quota
      const totalAvailable = user.monthly_chars + user.signup_bonus_chars + user.earned_chars;
      let remaining = totalAvailable - user.used_chars;
      
      // Voice Authorization
      let actualVoice = voice || 'id-ID-Standard-A';
      
      const isPremiumVoice = actualVoice.includes('Neural2') || actualVoice.includes('Studio') || actualVoice.includes('Chirp');
      const isStudioVoice = actualVoice.includes('Studio') || actualVoice.includes('Chirp');

      if (tier === 'FREE') {
        if (isPremiumVoice) {
          return res.status(403).json({ error: 'Suara premium (Neural2/Studio) hanya tersedia untuk paket STARTER ke atas. Silakan upgrade paket Anda.' });
        }
      } else if (tier === 'STARTER' || tier === 'KREATOR') {
        if (isStudioVoice) {
          return res.status(403).json({ error: 'Suara Studio/Chirp hanya tersedia untuk paket PRODUKTIF ke atas. Silakan upgrade paket Anda.' });
        }
      }

      // Multiplier logic
      let voiceTierName = 'Standard';
      if (actualVoice.includes('Wavenet')) voiceTierName = 'Wavenet';
      else if (actualVoice.includes('Neural2')) voiceTierName = 'Neural2';
      else if (actualVoice.includes('Studio')) voiceTierName = 'Studio';
      else if (actualVoice.includes('Chirp')) voiceTierName = 'Chirp';

      const multiplier = voiceConfig.tiers[voiceTierName] || 1;
      const totalCharCost = text.length * multiplier;

      if (totalCharCost > remaining) {
        return res.status(402).json({ error: `Kredit karakter tidak mencukupi (Membutuhkan ${totalCharCost} kredit). Anda memiliki ${remaining} kredit.` });
      }

      // Apply custom pronunciations
      let modifiedText = text;
      
      if (user.pronunciations) {
        const sortedWords = Object.keys(user.pronunciations).sort((a, b) => b.length - a.length);
        for (const word of sortedWords) {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
          modifiedText = modifiedText.replace(regex, user.pronunciations[word]);
        }
      }

      modifiedText = modifiedText
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\.id\b/gi, " dot ay di ")
        .replace(/\bAI\b/gi, "ey ay")
        .replace(/\bIT\b/g, "ay ti")
        .replace(/\bCEO\b/gi, "si i o")
        .replace(/\bVIP\b/gi, "vi ay pi")
        .replace(/\bAPI\b/gi, "ei pi ay");
        
      let ssmlText = `<speak>${modifiedText}`;
      if (tier === 'FREE') {
         ssmlText += `<break time="0.5s"/><prosody volume="-6dB">Dibuat dengan shinerva dot ay di.</prosody>`;
      }
      ssmlText += `</speak>`;

      // Synthesize
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { ssml: ssmlText },
          voice: { languageCode: 'id-ID', name: actualVoice },
          audioConfig: { 
            audioEncoding: 'MP3', 
            speakingRate: speed || 1.0,
            pitch: pitch || 0.0,
            volumeGainDb: volume || 0.0
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      // Success generation logic
      user.used_chars += totalCharCost;
      user.generation_count += 1;
      user.last_generation_at = Date.now();

      if (!user.history) user.history = [];
      user.history.unshift({
        id: generateId(),
        date: Date.now(),
        character_count: text.length,
        voice: actualVoice,
        tier: tier,
        is_teaser: false,
        credits_used: totalCharCost,
        multiplier: multiplier
      });

      if (user.history.length > 50) {
        user.history = user.history.slice(0, 50);
      }

      // Referral system hook
      if (user.generation_count === 1 && user.referred_by && !user.has_triggered_ref) {
        user.has_triggered_ref = true;
        const referrerRef = usersCol.doc(user.referred_by);
        const referrerDoc = await referrerRef.get();
        
        if (referrerDoc.exists) {
          const referrer = referrerDoc.data();
          if (referrer.valid_referrals < 2) {
             const refUpdates = { valid_referrals: admin.firestore.FieldValue.increment(1) };
             user.earned_chars += 5000;
             
             if (referrer.valid_referrals + 1 >= 2 && !referrer.has_received_referral_bonus) {
               refUpdates.has_received_referral_bonus = true;
               refUpdates.earned_chars = admin.firestore.FieldValue.increment(20000);
             }
             await referrerRef.update(refUpdates);
          }
        }
      }

      await usersCol.doc(user.id).set(user);
      res.json({ ...data, isTeaser: false });
    } catch (error) {
      console.error('TTS proxy error:', error);
      res.status(500).json({ error: 'Server error processing TTS' });
    }
  });

  // --- VITE FRONTEND SERVING ---
  
  let vite;
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template, render;
      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      !isProd && vite?.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

createServer();
