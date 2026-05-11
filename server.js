import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// --- FILE-BACKED DB ---
const dataFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}
const usersFile = path.join(dataFolder, 'users.json');

const otps = new Map(); // Store temporary OTPs { phone: { otp, expiresAt } }

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

  // --- MOCK AUTH MIDDLEWARE ---
  const authenticate = (req, res, next) => {
    // We expect the frontend to send user's email in 'Authorization' or a custom header 'x-user-email' to identify them safely in this mock environment.
    const email = req.headers['x-user-email'] || req.body.email; // For simplify
    let foundUser = null;
    for (const [id, u] of users.entries()) {
      if (u.email === email) {
        foundUser = u;
        break;
      }
    }
    if (foundUser) {
      req.user = foundUser;
    }
    // We let it pass even if not found for public routes, or enforce later
    next();
  };

  // --- API ROUTES ---
  
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    let foundUser = null;
    for (const [id, u] of users.entries()) {
      if (u.email === email && u.password === password) {
        foundUser = u;
        break;
      }
    }
    if (foundUser) {
      res.json({ success: true, message: 'Login successful', user: foundUser });
    } else {
      res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
  });

  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, whatsapp, refCode } = req.body;
    
    // Check existing
    for (const [id, u] of users.entries()) {
      if (u.email === email) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }
    }

    let referredBy = null;
    if (refCode) {
      for (const [id, u] of users.entries()) {
        if (u.referral_code === refCode) {
          referredBy = id;
          break;
        }
      }
    }

    const newUser = {
      id: generateId(),
      name,
      email,
      password,
      whatsapp: whatsapp || '',
      whatsapp_opted_in: !!whatsapp,
      email_subscribed: true,
      tier: 'FREE',
      signup_date: Date.now(),
      referral_code: generateRefCode(),
      referred_by: referredBy,
      valid_referrals: 0,
      has_received_referral_bonus: false,
      social_bonus_status: 'none',
      social_url: '',
      signup_bonus_chars: 10000,
      monthly_chars: 10000,
      earned_chars: 0, // social + referral
      used_chars: 0,
      generation_count: 0,
      pronunciations: {}
    };

    users.set(newUser.id, newUser);
    saveUsers();
    res.json({ success: true, message: 'Signup successful', user: newUser });
  });

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
        pronunciations: {}
      };
      users.set(id, foundUser);
    }
    
    saveUsers();
    res.json({ success: true, message: 'Login successful', user: foundUser });
  });

  app.get('/api/user/me', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.user });
  });

  app.get('/api/user/pronunciations', authenticate, (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ pronunciations: req.user.pronunciations || {} });
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


  // --- RATE LIMITER & CONCURRENCY ---
  const rateLimitStore = new Map();
  const activeRequests = new Map();

  const getClientIp = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const ttsRateLimiter = (req, res, next) => {
    const user = req.user;
    const tier = user ? user.tier : 'FREE';
    const clientId = user ? user.id : getClientIp(req);
    
    let maxRequestsPerMinute = 3;
    let maxSimultaneous = 1;

    // Additional Daily limit for free
    if (tier === 'FREE') {
      maxRequestsPerMinute = 3; // using per minute as per hour proxy for this implementation
      // "max 3 generations per hour, max 10 generations per day"
      // We will simplify to per-minute for in-memory, or implement precise check.
    }

    if (tier === 'STARTER' || tier === 'KREATOR') {
      maxRequestsPerMinute = 10;
      maxSimultaneous = 2;
    } else if (tier === 'PRODUKTIF' || tier === 'BISNIS' || tier === 'ENTERPRISE') {
      maxRequestsPerMinute = 30; 
      maxSimultaneous = 5;
    }

    const now = Date.now();
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
    if (tier === 'FREE' && user && user.generation_count >= 10) {
      // Just simple global count for demo, ideally track by day
      // return res.status(429).json({ error: 'Batas 10 generasi per hari telah tercapai.' });
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

      // Check Quota
      const charCost = text.length;
      const totalAvailable = user.monthly_chars + user.signup_bonus_chars + user.earned_chars;
      
      // Calculate remaining chars properly
      // We will deduct sequentially: 1. Monthly, 2. Earned, 3. Signup
      let remaining = totalAvailable - user.used_chars;
      
      if (charCost > remaining) {
        return res.status(402).json({ error: 'Kredit karakter tidak mencukupi. Sisa: ' + remaining });
      }

      // SMART VOICE ROUTING
      let actualVoice = voice || 'id-ID-Standard-A';
      const tier = user.tier;
      let isTeaser = false;
      
      // Prevent Studio voices on lower tiers
      if (actualVoice.includes('Studio') && tier !== 'BISNIS' && tier !== 'ENTERPRISE') {
         if (tier === 'FREE' || tier === 'STARTER') {
           return res.status(403).json({ error: 'Fitur Suara Studio (Teaser) ini hanya untuk paket Kreator ke atas. Silakan upgrade paket Anda.' });
         }
         isTeaser = true;
         if (text.length > 100) {
           return res.status(403).json({ error: 'Preview Suara Studio dibatasi maks 100 karakter. Upgrade ke paket Bisnis untuk akses penuh.' });
         }
      } else if (tier === 'FREE') {
         // Free users only get standard/wavenet
         actualVoice = actualVoice.replace('Neural2', 'Wavenet').replace('Studio', 'Wavenet');
      } else if (tier === 'STARTER' || tier === 'KREATOR') {
         // Cap to Neural2
         actualVoice = actualVoice.replace('Studio', 'Neural2');
      }

      // Apply custom pronunciations
      let modifiedText = text;
      
      if (user.pronunciations) {
        // Sort keys by length descending to avoid partial matches on shorter words first
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
      if (tier === 'FREE' || isTeaser) {
         ssmlText += `<break time="0.5s"/><prosody volume="-6dB">Dibuat dengan shinerva dot ay di.</prosody>`;
      }
      ssmlText += `</speak>`;

      // Proxy request to Google Cloud TTS API using REST
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
      user.used_chars += charCost;
      user.generation_count += 1;

      // Referral system hook: on first generation, grant referral bonus
      if (user.generation_count === 1 && user.referred_by && !user.has_triggered_ref) {
        user.has_triggered_ref = true;
        const referrer = users.get(user.referred_by);
        if (referrer && referrer.valid_referrals < 2) {
          referrer.valid_referrals += 1;
          user.earned_chars += 5000; // referred user bonus
          
          if (referrer.valid_referrals >= 2 && !referrer.has_received_referral_bonus) {
            referrer.has_received_referral_bonus = true;
            referrer.earned_chars += 20000; // referrer bonus
          }
        }
      }

      saveUsers();
      res.json({ ...data, isTeaser });
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
