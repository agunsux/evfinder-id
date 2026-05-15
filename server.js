import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import { authAdmin, dbAdmin } from './src/lib/firebaseAdmin.js';
import { rateLimit } from 'express-rate-limit';

import { PLANS } from './src/lib/plans.js';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const otps = new Map(); // Store temporary OTPs { phone: { otp, expiresAt } }

let voiceConfig = {
  tiers: { 'Standard': 1, 'Wavenet': 1, 'Neural2': 4, 'Studio': 40, 'Chirp': 8 },
  limits: { free_request_chars: 500, paid_request_chars: 5000, free_cooldown_sec: 15, paid_cooldown_sec: 2 }
};

async function loadVoiceConfig() {
  if (!dbAdmin) return;
  try {
    const doc = await dbAdmin.collection('config').doc('voice').get();
    if (doc.exists) voiceConfig = { ...voiceConfig, ...doc.data() };
  } catch (e) { console.error("Error loading voice config:", e); }
}
async function saveVoiceConfig() {
  if (!dbAdmin) return;
  try {
    await dbAdmin.collection('config').doc('voice').set(voiceConfig);
  } catch (e) { console.error("Error saving voice config:", e); }
}
loadVoiceConfig();

function generateRefCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiRouter = express.Router();

const authenticate = async (req, res, next) => {
    if (!authAdmin || !dbAdmin) {
      console.error("[Firebase Admin] Auth or DB not initialized.");
      return res.status(503).json({ error: 'Sistem autentikasi sementara tidak tersedia.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth token missing' });

    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email;
      const emailVerified = decodedToken.email_verified;

      // Allow bypass for certain providers (like Google) if they are usually pre-verified,
      // but Firebase usually sets email_verified to true for Google.
      // We block if explicitly false.
      if (!emailVerified) {
        return res.status(403).json({ 
          error: 'Email belum diverifikasi.', 
          message: 'Silakan verifikasi email Anda untuk mengakses layanan ini.' 
        });
      }
      
      const userRef = dbAdmin.collection('users').doc(uid);
      const userDoc = await userRef.get();
      let user = userDoc.exists ? userDoc.data() : null;

      if (!user) {
        // Try finding by email for migration
        const snapshot = await dbAdmin.collection('users').where('email', '==', email).limit(1).get();
        if (!snapshot.empty) {
          user = snapshot.docs[0].data();
          user.id = uid; 
          await userRef.set(user, { merge: true });
        } else {
          // New User Creation
          user = {
            id: uid,
            email: email,
            name: decodedToken.name || email.split('@')[0],
            tier: 'FREE',
            signup_date: Date.now(),
            monthly_chars: 10000,
            earned_chars: 0,
            used_chars: 0,
            generation_count: 0,
            referral_code: generateRefCode(),
            pronunciations: {},
            history: []
          };
          await userRef.set(user);
        }
      }

      req.user = user;
      req.userRef = userRef;
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error.message);
      res.status(401).json({ error: 'Token invalid or expired' });
    }
  };

  // --- API ROUTES ---
  
  apiRouter.post('/auth/sync', authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  apiRouter.post('/auth/login', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));
  apiRouter.post('/auth/signup', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));

  apiRouter.post('/auth/otp/request', (req, res) => {
    const { whatsapp } = req.body;
    if (!whatsapp) return res.status(400).json({ error: 'Nomor WhatsApp diperlukan' });
    
    // Generate a 4 digit OTP for mockup
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[OTP] WhatsApp: ${whatsapp} -> Kode OTP: ${otp}`);
    
    otps.set(whatsapp, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    res.json({ success: true, message: 'OTP telah dikirim ke WhatsApp Anda (mock: check console)' });
  });

    // Legacy OTP login logic is deprecated, forwarding to Firestore-based logic if hit
    apiRouter.post('/auth/otp/verify', async (req, res) => {
      res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' });
    });

    apiRouter.post('/auth/google', (req, res) => {
      res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' });
    });

  apiRouter.get('/user/referrals', authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    
    // Count how many people have used this user's referral code
    const snapshot = await dbAdmin.collection('users').where('referred_by', '==', req.user.id).get();
    const inviteCount = snapshot.size;

    res.json({
      referral_code: req.user.referral_code,
      invite_count: inviteCount,
      valid_referrals: req.user.valid_referrals,
      bonus_earned: req.user.has_received_referral_bonus ? 20000 : 0,
      has_received_bonus: req.user.has_received_referral_bonus
    });
  });

  apiRouter.get('/user/me', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.user });
  });

  apiRouter.get('/user/pronunciations', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ pronunciations: req.user.pronunciations || {} });
  });

  apiRouter.get('/user/history', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ history: req.user.history || [] });
  });

  apiRouter.get('/admin/voice-config', authenticate, (req, res) => {
    // Let all users see it, but only admin can change
    res.json(voiceConfig);
  });

  apiRouter.post('/admin/voice-config', authenticate, (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const { tiers, limits } = req.body;
    if (tiers) {
      voiceConfig.tiers = { ...voiceConfig.tiers, ...tiers };
    }
    if (limits) {
      voiceConfig.limits = { ...voiceConfig.limits, ...limits };
    }
    
    if (tiers || limits) {
      saveVoiceConfig();
      res.json({ success: true, voiceConfig });
    } else {
      res.status(400).json({ error: 'Invalid config' });
    }
  });

  apiRouter.post('/user/pronunciations', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { word, pronunciation } = req.body;
    if (!word) return res.status(400).json({ error: 'Word is required' });
    
    if (!req.user.pronunciations) req.user.pronunciations = {};
    
    if (pronunciation === null) {
      delete req.user.pronunciations[word];
    } else {
      req.user.pronunciations[word] = pronunciation;
    }
    
    await req.userRef.set(user, { merge: true });
    res.json({ success: true, pronunciations: req.user.pronunciations });
  });

  apiRouter.post('/user/social-share', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { url } = req.body;
    
    // Basic verification: check if it's a valid social media URL
    if (!url || !/(tiktok|instagram|facebook|twitter|x)\.com/.test(url)) {
      return res.status(400).json({ error: 'Harap masukkan URL postingan yang valid dari TikTok, Instagram, Facebook, atau X/Twitter.' });
    }

    if (req.user.social_bonus_status !== 'none') {
      return res.status(400).json({ error: 'Sudah pernah mengklaim bonus ini.' });
    }
    req.user.social_bonus_status = 'pending';
    req.user.social_url = url;
    await req.userRef.set(req.user, { merge: true });
    res.json({ success: true, message: 'Pengajuan berhasil. Menunggu verifikasi admin.', user: req.user });
  });

  apiRouter.post('/user/settings', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { whatsapp, whatsapp_opted_in, email_subscribed } = req.body;
    if (whatsapp !== undefined) req.user.whatsapp = whatsapp;
    if (whatsapp_opted_in !== undefined) req.user.whatsapp_opted_in = whatsapp_opted_in;
    if (email_subscribed !== undefined) req.user.email_subscribed = email_subscribed;
    await req.userRef.set(req.user, { merge: true });
    res.json({ success: true, user: req.user });
  });

  // --- ADMIN EXPORTS ---
  apiRouter.get('/admin/export/email', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    let csv = "Name,Email,Tier,Signup Date,Total Characters Used\n";
    const snapshot = await dbAdmin.collection('users').get();
    snapshot.forEach(doc => {
      const u = doc.data();
      if (u.email_subscribed) {
        csv += `"${u.name}","${u.email}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
      }
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
  apiRouter.post('/payment/create', authenticate, async (req, res) => {
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

  apiRouter.post('/payment/webhook', async (req, res) => {
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
          const userRef = dbAdmin.collection('users').doc(uid);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            const user = userDoc.data();
            const amount = parseInt(statusResponse.gross_amount);
            const matchedPlan = Object.values(PLANS).find(p => p.price === amount || p.yearlyPrice === amount);
            
            if (matchedPlan) {
              if (matchedPlan.type === 'topup') {
                user.earned_chars = (user.earned_chars || 0) + matchedPlan.credits;
              } else {
                user.tier = matchedPlan.tier;
                user.monthly_chars = matchedPlan.credits;
              }
              user.last_payment_at = Date.now();
              user.last_order_id = orderId;
              await userRef.set(user, { merge: true });
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

  apiRouter.get('/admin/export/whatsapp', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    let csv = "Name,WhatsApp,Tier,Signup Date,Total Characters Used\n";
    const snapshot = await dbAdmin.collection('users').get();
    snapshot.forEach(doc => {
      const u = doc.data();
      if (u.whatsapp_opted_in && u.whatsapp) {
        csv += `"${u.name}","${u.whatsapp}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
      }
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('whatsapp_list.csv');
    res.send(csv);
  });
  
  apiRouter.post('/admin/social-approvals/:id/approve', authenticate, async (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const targetId = req.params.id;
    const targetRef = dbAdmin.collection('users').doc(targetId);
    const targetDoc = await targetRef.get();
    if (!targetDoc.exists) return res.status(404).json({error: 'User not found'});
    const targetUser = targetDoc.data();
    if (targetUser.social_bonus_status === 'pending') {
       targetUser.social_bonus_status = 'approved';
       targetUser.earned_chars = (targetUser.earned_chars || 0) + 30000;
       await targetRef.set(targetUser, { merge: true });
       res.json({ success: true });
    } else {
       res.status(400).json({ error: 'Status is not pending' });
    }
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
    keyGenerator: (req) => req.user ? req.user.id : getClientIp(req),
    message: { error: 'Batas request per menit tercapai. Silakan coba lagi beberapa saat lagi.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const cooldownLimiter = (req, res, next) => {
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
    const user = req.user;
    if (user && user.tier === 'FREE' && user.generation_count >= 20) {
       return res.status(429).json({ error: 'Batas 20 generasi harian untuk paket FREE telah tercapai. Nikmati tak terbatas dengan paket STARTER hanya Rp19rb!' });
    }
    next();
  };

  const concurrencyLimiter = (req, res, next) => {
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

  apiRouter.post('/tts', authenticate, hourlyFreeLimiter, dailyFreeLimiter, cooldownLimiter, dailyLimitLimiter, ttsRateLimiterMiddleware, concurrencyLimiter, async (req, res) => {
    try {
      const { text, voice, speed, pitch, volume } = req.body;
      const apiKey = process.env.GOOGLE_API_KEY;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Harap masuk (login) untuk menggunakan layanan TTS.' });
      }

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Teks diperlukan untuk konversi suara.' });
      }

      if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY') {
        return res.status(401).json({ error: 'Sistem TTS sedang tidak tersedia (API Key missing).' });
      }

      // Tier Specific Constraints
      const tier = user.tier;
      const maxRequestChars = tier === 'FREE' ? voiceConfig.limits.free_request_chars : voiceConfig.limits.paid_request_chars;
      
      if (text.length > maxRequestChars) {
        return res.status(400).json({ error: `Batas karakter per request untuk paket ${tier} adalah ${maxRequestChars} karakter. Upgrade untuk limit lebih besar.` });
      }

      // Check Quota
      const charCost = text.length;
      const totalAvailable = user.monthly_chars + user.signup_bonus_chars + user.earned_chars;
      let remaining = totalAvailable - user.used_chars;
      
      // Voice Authorization - SMART VOICE ROUTING
      let actualVoice = voice || 'id-ID-Standard-A';
      
      const isNeuralVoice = actualVoice.includes('Neural2');
      const isWavenetVoice = actualVoice.includes('Wavenet');
      const isStudioVoice = actualVoice.includes('Studio') || actualVoice.includes('Chirp');

      const tierOrder = ["FREE", "STARTER", "KREATOR", "PRODUKTIF", "BISNIS", "ENTERPRISE"];
      const userTierIndex = tierOrder.indexOf(tier);

      if (isStudioVoice && userTierIndex < tierOrder.indexOf('BISNIS')) {
        return res.status(403).json({ error: 'Suara Studio Premium hanya tersedia untuk paket BISNIS ke atas. Silakan upgrade paket Anda.' });
      }
      if (isWavenetVoice && userTierIndex < tierOrder.indexOf('PRODUKTIF')) {
        return res.status(403).json({ error: 'Suara WaveNet hanya tersedia untuk paket PRODUKTIF ke atas. Silakan upgrade paket Anda.' });
      }
      if (isNeuralVoice && userTierIndex < tierOrder.indexOf('STARTER')) {
        return res.status(403).json({ error: 'Suara Neural2 hanya tersedia untuk paket STARTER ke atas. Silakan upgrade paket Anda.' });
      }

      // Multiplier logic
      let voiceTierName = 'Standard';
      if (isWavenetVoice) voiceTierName = 'Wavenet';
      else if (isNeuralVoice) voiceTierName = 'Neural2';
      else if (isStudioVoice) voiceTierName = 'Studio';

      const multiplier = voiceConfig.tiers[voiceTierName] || 1;
      const totalCharCost = text.length * multiplier;

      if (totalCharCost > remaining) {
        return res.status(402).json({ error: 'Kredit karakter tidak mencukupi (Membutuhkan ' + totalCharCost + ' kredit). Anda memiliki ' + remaining + ' kredit.' });
      }

      // Initial text cleaning and escaping
      let modifiedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      // Apply custom pronunciations (these can now safely contain SSML if we want, 
      // but we need to make sure the user-provided rules are NOT escaped if they are meant to be SSML)
      // Actually, if we want to allow SSML in rules, we shouldn't escape the pronunciation value.
      
      if (user.pronunciations) {
        const sortedWords = Object.keys(user.pronunciations).sort((a, b) => b.length - a.length);
        for (const word of sortedWords) {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
          // We allow the substitution to remain un-escaped to support SSML from the rule
          modifiedText = modifiedText.replace(regex, user.pronunciations[word]);
        }
      }

      // Handle Emphasis Tags (Special internal tags)
      modifiedText = modifiedText
        .replace(/\[EMPHASIS_START\]/g, '<emphasis level="strong">')
        .replace(/\[EMPHASIS_END\]/g, '</emphasis>');

      // Global fixes (careful not to break SSML)
      modifiedText = modifiedText
        .replace(/\.id\b/gi, " dot ay id ")
        .replace(/\bAI\b/gi, "ey ay")
        .replace(/\bIT\b/g, "ay ti")
        .replace(/\bCEO\b/gi, "si i o")
        .replace(/\bVIP\b/gi, "vi ay pi")
        .replace(/\bAPI\b/gi, "ei pi ay");
        
      let ssmlText = `<speak>${modifiedText}`;
      
      // WATERMARK FOR FREE TIER
      if (tier === 'FREE') {
         ssmlText += `<break time="500ms"/><prosody volume="-6dB">Dibuat dengan Rungu dot ay id.</prosody>`;
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
        text_length: text.length,
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
        const referrerRef = dbAdmin.collection('users').doc(user.referred_by);
        const referrerDoc = await referrerRef.get();
        if (referrerDoc.exists) {
          const referrer = referrerDoc.data();
          if (referrer.valid_referrals < 2) {
             const updates = { valid_referrals: (referrer.valid_referrals || 0) + 1 };
             user.earned_chars += 5000;
             if ((referrer.valid_referrals || 0) + 1 >= 2 && !referrer.has_received_referral_bonus) {
               updates.has_received_referral_bonus = true;
               updates.earned_chars = (referrer.earned_chars || 0) + 20000;
             }
             await referrerRef.update(updates);
          }
        }
      }

      await req.userRef.set(user, { merge: true });
      res.json({ ...data, isTeaser: false });
    } catch (error) {
      console.error('TTS proxy error:', error);
      res.status(500).json({ error: 'Server error processing TTS' });
    }
  });

// --- VITE FRONTEND SERVING ---
async function setupFrontend() {
  // Skip on Vercel as Vercel serves the static files directly from the dist folder
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      
      app.use('*', async (req, res) => {
        const url = req.originalUrl;
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
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }
}

// --- DEBUG & HEALTH ---
apiRouter.get("/", (req, res) => {
  res.json({ message: "Shinerva API is live", version: "1.0.2" });
});

apiRouter.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    firebaseAdmin: !!authAdmin,
    projectId: process.env.FIREBASE_PROJECT_ID,
    isCorrectProject: process.env.FIREBASE_PROJECT_ID === "practical-gecko-476621-q4",
    hasClientConfig: fs.existsSync(path.resolve(process.cwd(), 'firebase-applet-config.json'))
  });
});

// Mount the router at both /api and / and ensure path compatibility
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace('/api', '') || '/';
  }
  next();
}, apiRouter);

setupFrontend();

app.get("/api/debug-env", (req, res) => {
  res.json({
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    hasApiKey: !!process.env.VITE_FIREBASE_API_KEY,
    apiKeyPrefix: process.env.VITE_FIREBASE_API_KEY ? process.env.VITE_FIREBASE_API_KEY.slice(0, 6) : "(none)",
    apiKeySuffix: process.env.VITE_FIREBASE_API_KEY ? process.env.VITE_FIREBASE_API_KEY.slice(-4) : "(none)",
    apiKeyLen: process.env.VITE_FIREBASE_API_KEY ? process.env.VITE_FIREBASE_API_KEY.length : 0,
    nodeEnv: process.env.NODE_ENV
  });
});

// setupFrontend is called once below

// Only listen when running standalone (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

export default app;
