import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import { authAdmin } from './src/lib/firebaseAdmin.js';
import { rateLimit } from 'express-rate-limit';

import { PLANS } from './src/lib/plans.js';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// --- FILE-BACKED DB ---
const dataFolder = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}
const usersFile = path.join(dataFolder, 'users.json');
const voiceConfigFile = path.join(dataFolder, 'voice_config.json');

const otps = new Map(); // Store temporary OTPs { phone: { otp, expiresAt } }

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

if (fs.existsSync(voiceConfigFile)) {
  try {
    voiceConfig = JSON.parse(fs.readFileSync(voiceConfigFile, 'utf8'));
  } catch(e) {
    console.error("Error reading voice_config.json", e);
  }
}

function saveVoiceConfig() {
  fs.writeFileSync(voiceConfigFile, JSON.stringify(voiceConfig, null, 2));
}

let users = new Map();
if (fs.existsSync(usersFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    users = new Map(data);
  } catch(e) {
    console.error("Error reading users.json", e);
  }
}

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(Array.from(users.entries()), null, 2));
}

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}
function generateRefCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Ensure an admin user exists for exports
users.set('admin', {
  id: 'admin', name: 'Admin', email: 'admin@shinerva.id', password: 'admin', tier: 'ENTERPRISE', valid_referrals: 0, has_received_referral_bonus: false, signup_bonus_chars: 10000, monthly_chars: 1000000, earned_chars: 0, used_chars: 0, generation_count: 0, email_subscribed: true, whatsapp_opted_in: false
});

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email;
      
      if (!email) {
        return res.status(401).json({ error: 'Token does not contain email' });
      }

      // Sync with local users map
      let user = users.get(uid);
      
      // Migration: If not found by UID, try finding by email
      if (!user) {
        for (const [id, u] of users.entries()) {
          if (u.email === email) {
            user = u;
            user.id = uid; 
            users.set(uid, user);
            users.delete(id);
            break;
          }
        }
      }

      // If still not found, it's a completely new Firebase user
      if (!user) {
        const refCode = req.headers['x-ref-code'] || '';
        let referredBy = null;
        if (refCode) {
          for (const [rid, ru] of users.entries()) {
            if (ru.referral_code === refCode) {
              referredBy = rid;
              break;
            }
          }
        }

        user = {
          id: uid,
          name: decodedToken.name || email.split('@')[0],
          email: email,
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
        users.set(uid, user);
        saveUsers();
        console.log(`[Server] New user created via Firebase: ${email} (${uid})`);
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
         saveUsers();
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
  app.post('/api/auth/sync', authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  // Legacy manual auth routes are disabled in favor of Firebase Auth
  app.post('/api/auth/login', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));
  app.post('/api/auth/signup', (req, res) => res.status(410).json({ error: 'Endpoint deprecated. Use Firebase Auth.' }));

  app.post('/api/auth/otp/request', (req, res) => {
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

  app.post('/api/auth/otp/verify', (req, res) => {
    const { whatsapp, otp } = req.body;
    if (!whatsapp || !otp) return res.status(400).json({ error: 'WhatsApp dan OTP diperlukan' });
    
    const record = otps.get(whatsapp);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'OTP tidak valid atau expired' });
    }
    
    // Clear OTP
    otps.delete(whatsapp);
    
    // Find exist or create
    let foundUser = null;
    for (const [id, u] of users.entries()) {
      if (u.whatsapp === whatsapp) {
        foundUser = u;
        break;
      }
    }
    
    if (!foundUser) {
      const id = generateId();
      foundUser = {
        id,
        name: 'User ' + whatsapp.slice(-4),
        email: whatsapp + '@shinerva.id', // temp email
        password: generateId(),
        whatsapp: whatsapp,
        whatsapp_opted_in: true,
        email_subscribed: true,
        tier: 'FREE',
        signup_date: Date.now(),
        referral_code: generateRefCode(),
        referred_by: null,
        valid_referrals: 0,
        has_received_referral_bonus: false,
        social_bonus_status: 'none',
        social_url: '',
        signup_bonus_chars: 5000, // less bonus for OTP maybe? default is 5000 according to UI 
        monthly_chars: 10000,
        earned_chars: 0,
        used_chars: 0,
        generation_count: 0,
        pronunciations: {},
        history: []
      };
      users.set(id, foundUser);
    }
    
    saveUsers();
    res.json({ success: true, message: 'Login successful', user: foundUser });
  });

  app.post('/api/auth/google', (req, res) => {
    const { email, name, googleId } = req.body;
    
    // Find or create
    let foundUser = null;
    for (const [id, u] of users.entries()) {
      if (u.email === email) {
        foundUser = u;
        break;
      }
    }
    
    if (!foundUser) {
      // Create new user (similar to signup)
      foundUser = {
        id: generateId(),
        name,
        email,
        password: 'google-auth-' + generateId(), // Dummy password
        whatsapp: '',
        whatsapp_opted_in: false,
        email_subscribed: true,
        tier: 'FREE',
        signup_date: Date.now(),
        referral_code: generateRefCode(),
        referred_by: null,
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
        history: []
      };
      users.set(foundUser.id, foundUser);
      saveUsers();
    }
    
    res.json({ success: true, message: 'Login successful', user: foundUser });
  });

  app.get('/api/user/referrals', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    
    // Count how many people have used this user's referral code
    let inviteCount = 0;
    for (const [id, u] of users.entries()) {
      if (u.referred_by === req.user.id) {
        inviteCount++;
      }
    }

    res.json({
      referral_code: req.user.referral_code,
      invite_count: inviteCount,
      valid_referrals: req.user.valid_referrals,
      bonus_earned: req.user.has_received_referral_bonus ? 20000 : 0,
      has_received_bonus: req.user.has_received_referral_bonus
    });
  });

  app.get('/api/user/me', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.user });
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

  app.post('/api/admin/voice-config', authenticate, (req, res) => {
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

  app.post('/api/user/pronunciations', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { word, pronunciation } = req.body;
    if (!word) return res.status(400).json({ error: 'Word is required' });
    
    if (!req.user.pronunciations) req.user.pronunciations = {};
    
    if (pronunciation === null) {
      delete req.user.pronunciations[word];
    } else {
      req.user.pronunciations[word] = pronunciation;
    }
    
    saveUsers();
    res.json({ success: true, pronunciations: req.user.pronunciations });
  });

  app.post('/api/user/social-share', authenticate, (req, res) => {
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
    saveUsers();
    res.json({ success: true, message: 'Pengajuan berhasil. Menunggu verifikasi admin.', user: req.user });
  });

  app.post('/api/user/settings', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { whatsapp, whatsapp_opted_in, email_subscribed } = req.body;
    if (whatsapp !== undefined) req.user.whatsapp = whatsapp;
    if (whatsapp_opted_in !== undefined) req.user.whatsapp_opted_in = whatsapp_opted_in;
    if (email_subscribed !== undefined) req.user.email_subscribed = email_subscribed;
    saveUsers();
    res.json({ success: true, user: req.user });
  });

  // --- ADMIN EXPORTS ---
  app.get('/api/admin/export/email', authenticate, (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    let csv = "Name,Email,Tier,Signup Date,Total Characters Used\n";
    for (const [id, u] of users.entries()) {
      if (u.email_subscribed) {
        csv += `"${u.name}","${u.email}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
      }
    }
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
          // If we use ORDER-UID-TIMESTAMP
          const uid = parts[1];
          const user = users.get(uid);

          if (user) {
            const planId = statusResponse.item_details ? statusResponse.item_details[0].id : null;
            // Fallback: If not in notification, we might need to store pending orders
            // For now, let's look at gross_amount to match plan
            const amount = parseInt(statusResponse.gross_amount);
            
            const matchedPlan = Object.values(PLANS).find(p => p.price === amount || p.yearlyPrice === amount);
            
            if (matchedPlan) {
              if (matchedPlan.type === 'topup') {
                user.earned_chars += matchedPlan.credits;
              } else {
                user.tier = matchedPlan.tier;
                user.monthly_chars = matchedPlan.credits;
              }
              user.last_payment_at = Date.now();
              user.last_order_id = orderId;
              saveUsers();
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

  app.get('/api/admin/export/whatsapp', authenticate, (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    let csv = "Name,WhatsApp,Tier,Signup Date,Total Characters Used\n";
    for (const [id, u] of users.entries()) {
      if (u.whatsapp_opted_in && u.whatsapp) {
        csv += `"${u.name}","${u.whatsapp}","${u.tier}","${new Date(u.signup_date).toISOString()}","${u.used_chars}"\n`;
      }
    }
    res.header('Content-Type', 'text/csv');
    res.attachment('whatsapp_list.csv');
    res.send(csv);
  });
  
  app.post('/api/admin/social-approvals/:id/approve', authenticate, (req, res) => {
    if (!req.user || req.user.tier !== 'ENTERPRISE') return res.status(403).json({error: 'Forbidden'});
    const targetId = req.params.id;
    const targetUser = users.get(targetId);
    if (!targetUser) return res.status(404).json({error: 'User not found'});
    if (targetUser.social_bonus_status === 'pending') {
       targetUser.social_bonus_status = 'approved';
       targetUser.earned_chars += 30000;
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

  app.post('/api/tts', authenticate, hourlyFreeLimiter, dailyFreeLimiter, cooldownLimiter, dailyLimitLimiter, ttsRateLimiterMiddleware, concurrencyLimiter, async (req, res) => {
    console.log('[DEBUG] Hit /api/tts');
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
        const referrer = users.get(user.referred_by);
        if (referrer && referrer.valid_referrals < 2) {
          referrer.valid_referrals += 1;
          user.earned_chars += 5000;
          
          if (referrer.valid_referrals >= 2 && !referrer.has_received_referral_bonus) {
            referrer.has_received_referral_bonus = true;
            referrer.earned_chars += 20000;
          }
        }
      }

      saveUsers();
      res.json({ ...data, isTeaser: false });
    } catch (error) {
      console.error('TTS proxy error:', error);
      res.status(500).json({ error: 'Server error processing TTS' });
    }
  });

  // --- VITE FRONTEND SERVING ---
  
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

  // --- DEBUG & HEALTH ---
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      firebaseAdmin: !!authAdmin,
      projectId: process.env.FIREBASE_PROJECT_ID,
      isCorrectProject: process.env.FIREBASE_PROJECT_ID === "practical-gecko-476621-q4"
    });
  });

  app.get("/api/debug-env", (req, res) => {
    res.json({
      projectId: process.env.FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.VITE_FIREBASE_API_KEY,
      apiKeyPrefix: process.env.VITE_FIREBASE_API_KEY ? process.env.VITE_FIREBASE_API_KEY.slice(0, 5) : "MISSING",
      nodeEnv: process.env.NODE_ENV
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

createServer();
