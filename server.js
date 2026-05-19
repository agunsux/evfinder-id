import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import { authAdmin, dbAdmin, initErrorMsg } from './src/lib/firebaseAdmin.js';

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
import { PLANS } from './src/lib/plans.js';

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

const genAI = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// --- VOICE CONFIG ---
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

async function loadInitialConfig() {
  if (dbAdmin) {
    try {
      const doc = await dbAdmin.collection('config').doc('voices').get();
      if (doc.exists) {
        voiceConfig = { ...voiceConfig, ...doc.data() };
        console.log("[Firebase] Global voice config loaded.");
      }
    } catch (err) {
      console.warn("[Firebase] Could not load global config, using defaults.");
    }
  }
}
loadInitialConfig();

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}
function generateRefCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// --- FIRESTORE HELPERS ---
async function getUser(uid) {
  if (!dbAdmin) return null;
  try {
    const doc = await dbAdmin.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error(`[Firestore] Error getting user ${uid}:`, err);
    return null;
  }
}

async function saveUser(uid, userData) {
  if (!dbAdmin) return;
  try {
    await dbAdmin.collection('users').doc(uid).set(userData, { merge: true });
  } catch (err) {
    console.error(`[Firestore] Error saving user ${uid}:`, err);
  }
}

async function findUserByEmail(email) {
  if (!dbAdmin) return null;
  try {
    const snapshot = await dbAdmin.collection('users').where('email', '==', email).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  } catch (err) {
    console.error(`[Firestore] Error finding user by email ${email}:`, err);
    return null;
  }
}

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
      const email = decodedToken.email;
      
      if (!email) {
        return res.status(401).json({ error: 'Token does not contain email' });
      }

      // Sync with Firestore
      let user = await getUser(uid);
      
      const currentEmailVerified = !!decodedToken.email_verified;
      const lowerEmail = email.toLowerCase();

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
          name: decodedToken.name || email.split('@')[0],
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
          signup_bonus_chars: 10000, 
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

      // Monthly Credits Reset Check
      const now = new Date();
      const lastCheck = user.last_reset_check ? new Date(user.last_reset_check) : new Date(user.signup_date);
      if (now.getMonth() !== lastCheck.getMonth() || now.getFullYear() !== lastCheck.getFullYear()) {
         // Reset monthly allowance based on tier
         const tierLimits = {
           'FREE': 10000,
           'STARTER': 50000,
           'KREATOR': 150000,
           'PRODUKTIF': 400000,
           'BISNIS': 1500000,
           'ENTERPRISE': 5000000
         };
         user.monthly_chars = tierLimits[user.tier] || 10000;
         user.last_reset_check = Date.now();
         await saveUser(uid, { monthly_chars: user.monthly_chars, last_reset_check: user.last_reset_check });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error.message);
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

  // Legacy manual auth routes are disabled in favor of Firebase Auth
  app.all('/api/auth/login', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));
  app.all('/api/auth/signup', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));
  app.all('/api/auth/otp/*', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Google Login.' }));
  app.all('/api/auth/google', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use client-side Firebase Google Auth.' }));

  app.get('/api/user/me', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.user });
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
  app.get('/api/admin/export/email', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
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
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_KEY',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_KEY'
  });

  // --- PAYMENT ROUTES ---
  app.post('/api/payment/create', authenticate, async (req, res) => {
    const { planId, billingCycle } = req.body;
    const user = req.user;

    const plan = Object.values(PLANS).find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Paket tidak valid' });
    }

    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    const orderId = `ORDER-${user.id}-${generateId().substring(0, 4)}-${Date.now()}`;

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
        id: plan.id,
        price: price,
        quantity: 1,
        name: `Paket ${plan.name} (${billingCycle || 'One-time'})`
      }],
      callbacks: {
        finish: `${req.protocol}://${req.get('host')}`
      }
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      // Save pending transaction if needed, but for simplicity we rely on webhook
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (error) {
      console.error('Midtrans Error:', error);
      res.status(500).json({ error: 'Gagal membuat transaksi pembayaran' });
    }
  });

  app.post('/api/payment/webhook', async (req, res) => {
    const notification = req.body;
    try {
      const statusResponse = await snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud: ${fraudStatus}`);

      if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
        if (fraudStatus === 'challenge') {
          // TODO: handle challenge case
        } else {
          // SUCCESS
          // Extract UID from orderId if we saved it, or we need to find user by some other way
          // Actually, we should have passed UID in metadata or something.
          // Let's use a simple lookup for now or pass custom field.
          // For now, let's assume we can get it from item_details or custom_field
          
          // Re-fetch custom fields if available
          // Since we didn't use custom_field in createTransaction, let's look at how we can identify the user.
          // Better: include user UID in orderId prefix or use metadata.
          
          const parts = orderId.split('-');
          const uid = parts[1];
          const user = await getUser(uid);

          if (user) {
            const planId = statusResponse.item_details ? statusResponse.item_details[0].id : null;
            const amount = parseInt(statusResponse.gross_amount);
            
            const matchedPlan = Object.values(PLANS).find(p => p.price === amount || p.yearlyPrice === amount);
            
            if (matchedPlan) {
              const updates = {};
              if (matchedPlan.type === 'topup') {
                user.earned_chars += matchedPlan.credits;
                updates.earned_chars = user.earned_chars;
              } else {
                user.tier = matchedPlan.tier;
                user.monthly_chars = matchedPlan.credits;
                updates.tier = user.tier;
                updates.monthly_chars = user.monthly_chars;
              }
              user.last_payment_at = Date.now();
              user.last_order_id = orderId;
              updates.last_payment_at = user.last_payment_at;
              updates.last_order_id = orderId;
              
              await saveUser(uid, updates);
              console.log(`User ${user.email} upgraded to ${matchedPlan.tier} / received ${matchedPlan.credits} credits`);
            }
          }
        }
      }
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(500).send('Error');
    }
  });

  app.get('/api/admin/export/whatsapp', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
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
  const activeRequests = new Map();
  const getClientIp = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const TIER_LIMITS = {
    'FREE': { requests: 2, simultaneous: 1 },
    'STARTER': { requests: 10, simultaneous: 2 },
    'KREATOR': { requests: 10, simultaneous: 2 },
    'PRODUKTIF': { requests: 30, simultaneous: 5 },
    'BISNIS': { requests: 30, simultaneous: 5 },
    'ENTERPRISE': { requests: 30, simultaneous: 5 },
  };

  const ttsRateLimiterMiddleware = rateLimit({
    windowMs: 60 * 1000,
    max: (req) => {
      const tier = req.user ? req.user.tier : 'FREE';
      return TIER_LIMITS[tier]?.requests || 2;
    },
    skip: (req) => req.body && req.body.isSample === true,
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

    const activeCount = activeRequests.get(clientId) || 0;
    if (activeCount >= maxSimultaneous) {
      return res.status(429).json({ error: 'Terlalu banyak antrean proses bersamaan. Harap tunggu proses sebelumnya selesai.' });
    }

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

  const hourlyFreeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: (req) => (req.user && req.user.tier === 'FREE' ? 3 : 1000),
    skip: (req) => req.body && req.body.isSample === true,
    keyGenerator: (req) => req.user ? req.user.id : getClientIp(req),
    message: { error: 'Batas 3 generasi per jam untuk paket FREE tercapai. Upgrade untuk akses tak terbatas!' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const dailyFreeLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: (req) => (req.user && req.user.tier === 'FREE' ? 10 : 5000),
    skip: (req) => req.body && req.body.isSample === true,
    keyGenerator: (req) => req.user ? req.user.id : getClientIp(req),
    message: { error: 'Batas 10 generasi per hari untuk paket FREE tercapai. Nikmati tak terbatas dengan paket STARTER hanya Rp19rb!' },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Helper to convert Raw PCM to WAV
function pcmToWav(pcmBase64, sampleRate = 24000) {
  const pcmData = Buffer.from(pcmBase64, 'base64');
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.length, true);
  // WAVE identifier
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // format chunk size
  view.setUint16(20, 1, true); // sample format (PCM)
  view.setUint16(22, 1, true); // channel count (mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align)
  view.setUint16(32, 2, true); // block align (channel count * bytes per sample)
  view.setUint16(34, 16, true); // bits per sample

  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmData.length, true);

  // PCM data
  const pcmBytes = new Uint8Array(pcmData);
  new Uint8Array(buffer, 44).set(pcmBytes);

  return Buffer.from(buffer).toString('base64');
}

  // --- TTS GENERATION ---
  const handleTtsRequest = async (req, res) => {
    console.log(`[TTS Handler] Method: ${req.method} Path: ${req.url} Body:`, { ...req.body, text: req.body?.text?.slice(0, 20) + '...' });
    try {
      let { text, voice, speed, pitch, volume, isSample } = req.body;
      const apiKey = clean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
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

      if (!apiKey) {
        console.error('[TTS Configuration Error] Missing API Key. GOOGLE_API_KEY or GEMINI_API_KEY must be set.');
        return res.status(503).json({ error: 'Layanan TTS sedang dalam pemeliharaan (Konfigurasi API tidak ditemukan).' });
      }

      const tier = user.tier || 'FREE';
      
      // Voice Authorization - SMART VOICE ROUTING
      let actualVoice = voice || 'id-ID-Standard-A';
      
      const isNeuralVoice = actualVoice.includes('Neural2');
      const isWavenetVoice = actualVoice.includes('Wavenet');
      const isStudioVoice = actualVoice.includes('Studio') || actualVoice.includes('Chirp') || isGeminiVoice;

      const tierOrder = ["FREE", "STARTER", "KREATOR", "PRODUKTIF", "BISNIS", "ENTERPRISE"];
      const userTierIndex = tierOrder.indexOf(tier);

      if (!isSample && text.length >= 150) {
        if (isStudioVoice && userTierIndex < tierOrder.indexOf('BISNIS')) {
          return res.status(403).json({ error: 'Suara Premium ini hanya tersedia untuk paket BISNIS ke atas. Silakan upgrade paket Anda.' });
        }
        if (isWavenetVoice && userTierIndex < tierOrder.indexOf('PRODUKTIF')) {
          return res.status(403).json({ error: 'Suara WaveNet hanya tersedia untuk paket PRODUKTIF ke atas. Silakan upgrade paket Anda.' });
        }
        if (isNeuralVoice && userTierIndex < tierOrder.indexOf('STARTER')) {
          return res.status(403).json({ error: 'Suara Neural2 hanya tersedia untuk paket STARTER ke atas. Silakan upgrade paket Anda.' });
        }
      }

      // Multiplier logic
      let voiceTierName = 'Standard';
      if (isWavenetVoice) voiceTierName = 'Wavenet';
      else if (isNeuralVoice) voiceTierName = 'Neural2';
      else if (isStudioVoice) voiceTierName = 'Studio';

      const multiplier = voiceConfig.tiers[voiceTierName] || 1;
      const totalCharCost = isSample ? 0 : text.length * multiplier;

      const totalAvailable = (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0);
      let remaining = totalAvailable - (user.used_chars || 0);

      if (!isSample && totalCharCost > remaining) {
        return res.status(402).json({ error: 'Kredit karakter tidak mencukupi (Membutuhkan ' + totalCharCost + ' kredit).' });
      }

      // Rungu Engine logic
      let modifiedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      if (isGeminiVoice) {
        // Prepare text for Gemini (strip SSML but keep expressives)
        modifiedText = text; // Gemini doesn't need SSML escaping like this
      } else {
        // Interpret Expressive Prosody Cues for SSML
        modifiedText = modifiedText
          .replace(/\[semangat\]/gi, '<prosody rate="1.1" pitch="+2st">')
          .replace(/\[\/semangat\]/gi, '</prosody>')
          .replace(/\[sedih\]/gi, '<prosody rate="0.85" pitch="-2st" volume="soft">')
          .replace(/\[\/sedih\]/gi, '</prosody>')
          .replace(/\[serius\]/gi, '<prosody rate="0.95" pitch="-1st" volume="medium">')
          .replace(/\[\/serius\]/gi, '</prosody>')
          .replace(/\[bisik\]/gi, '<prosody volume="x-soft" rate="0.9">')
          .replace(/\[\/bisik\]/gi, '</prosody>')
          .replace(/\[teriak\]/gi, '<emphasis level="strong"><prosody volume="loud" pitch="+3st">')
          .replace(/\[\/teriak\]/gi, '</prosody></emphasis>');
      }

      // Pronunciation Global Dictionary
      const globalPhonetics = { "AI": "ey ay", "IT": "ay ti", "Shinerva": "shi ner va", "RUNGU": "ru ngu" };
      const allPronunciations = { ...globalPhonetics, ...(user.pronunciations || {}) };
      
      let processedText = modifiedText;
      if (!isGeminiVoice) {
         // Apply pronunciation only for SSML path for now to avoid breaking Gemini's natural engine
         Object.entries(allPronunciations).forEach(([word, pron]) => {
           const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
           const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
           processedText = processedText.replace(regex, pron);
         });
      }

      let finalAudioContent = "";
      if (isGeminiVoice) {
        const response = await genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{ parts: [{ text: processedText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        });
        const pcmBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!pcmBase64) throw new Error("Gemini TTS returned no audio data");
        finalAudioContent = pcmToWav(pcmBase64, 24000);
      } else {
        const ssmlText = `<speak>${processedText}${tier === 'FREE' ? '<break time="600ms"/><prosody volume="-6dB" rate="0.95">Dihasilkan melalui Rungu Engine di Shinerva dot ai di.</prosody>' : ''}</speak>`;
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml: ssmlText },
            voice: { languageCode: 'id-ID', name: actualVoice },
            audioConfig: { 
              audioEncoding: 'MP3', 
              speakingRate: speed || 1.0, pitch: pitch || 0.0, volumeGainDb: volume || 0.0
            }
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Google TTS Error');
        finalAudioContent = data.audioContent;
      }

      if (!isSample) {
        user.used_chars += totalCharCost;
        user.generation_count += 1;
        user.last_generation_at = Date.now();
        if (!user.history) user.history = [];
        user.history.unshift({
          id: generateId(),
          date: Date.now(),
          text_length: text.length,
          voice: actualVoice,
          tier: tier,
          duration: Math.round(text.length / 15),
          credits_used: totalCharCost
        });

        await saveUser(req.user.id, {
          used_chars: user.used_chars,
          generation_count: user.generation_count,
          last_generation_at: user.last_generation_at,
          history: user.history 
        });
      }

      res.json({ audioContent: finalAudioContent, voice: actualVoice });
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
        code: 'TTS_FAILED'
      });
    }
  };

  // --- DEBUG & HEALTH ---
  app.get("/api/auth/diag", (req, res) => {
    const diag = {
      firebaseAdminInitialized: !!authAdmin,
      initError: initErrorMsg || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "(missing)",
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
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
  app.post(['/api/tts/sample'], (req, res, next) => { req.body.isSample = true; next(); }, ttsRateLimiterMiddleware, handleTtsRequest);
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT} (Express, API, and Frontend ready)`);
  });
}

createServer().catch(err => {
  console.error("CRITICAL: Server failed to start:", err);
  process.exit(1);
});
