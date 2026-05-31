/**
 * SHINERVA - Server-Side Auth API Route (Magic Link & Verification)
 * =================================================================
 * POST /api/auth/magic-link
 *
 * Implements: Option A SMTP Failover Cascade
 * Supports: Magic Link (signIn) and Email Verification (verifyEmail)
 * Uses Firebase Admin SDK to keep Firebase as Source of Truth.
 */

import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// ─── 1. Structured Logging ──────────────────────────────────────────────────
function logEvent(type, details) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, type, ...details }));
}

function logError(type, error, details = {}) {
  const timestamp = new Date().toISOString();
  console.error(JSON.stringify({
    timestamp,
    type,
    error: error?.message || error,
    stack: error?.stack,
    ...details
  }));
}

// ─── 2. Firebase Admin Init ─────────────────────────────────────────────────
let auth = null;

function initFirebase() {
  if (auth) return;
  try {
    if (admin.apps.length > 0) {
      auth = admin.auth();
      logEvent('FIREBASE_INIT_SUCCESS', { source: 'existing_app' });
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && rawPrivateKey) {
        const formatKey = (k) => {
          const clean = k.trim().replace(/\\n/g, '\n');
          if (clean.includes('-----BEGIN PRIVATE KEY-----') && clean.includes('\n')) return clean;
          const b64 = clean.replace(/-----BEGIN [^-]+-----/g, '').replace(/-----END [^-]+-----/g, '').replace(/\s/g, '');
          if (!b64 || b64.length < 100) return clean;
          const chunks = b64.match(/.{1,64}/g) || [b64];
          return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
        };
        const app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formatKey(rawPrivateKey),
          }),
          projectId,
        });
        auth = admin.auth(app);
        logEvent('FIREBASE_INIT_SUCCESS', { source: 'env_vars' });
      } else {
        logError('FIREBASE_INIT_MISSING_VARS', 'Missing one or more FIREBASE_ env vars');
      }
    }
  } catch (err) {
    logError('FIREBASE_INIT_FAILED', err);
  }
}

initFirebase();

// ─── 3. Transporter Setup ───────────────────────────────────────────────────
let primaryTransport = null;
let fallbackTransport = null;

function initTransports() {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    primaryTransport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      pool: true, maxConnections: 5,
      connectionTimeout: 15000, socketTimeout: 30000,
    });
    logEvent('SMTP_INIT_PRIMARY', { status: 'READY' });
  } else {
    logError('SMTP_INIT_MISSING_PRIMARY', 'Missing primary SMTP env vars');
  }

  if (process.env.FALLBACK_EMAIL && process.env.FALLBACK_EMAIL_PASSWORD) {
    fallbackTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.FALLBACK_EMAIL, pass: process.env.FALLBACK_EMAIL_PASSWORD },
      pool: true, maxConnections: 3,
      connectionTimeout: 15000, socketTimeout: 30000,
    });
    logEvent('SMTP_INIT_FALLBACK', { status: 'READY' });
  } else {
    logError('SMTP_INIT_MISSING_FALLBACK', 'Missing fallback Gmail env vars');
  }
}

initTransports();

// ─── 4. Email Templates ─────────────────────────────────────────────────────
function buildMagicLinkEmail(link, toEmail, isVerification = false, baseUrl = 'https://shinerva.id') {
  const title = isVerification ? 'Verifikasi Email Shinerva Anda' : 'Masuk ke Shinerva';
  const header = isVerification ? 'Verifikasi Email' : 'Masuk ke Shinerva';
  const cta = isVerification ? 'Verifikasi Sekarang' : 'Masuk Sekarang';
  const subtitle = isVerification 
    ? 'Klik tombol di bawah untuk memverifikasi alamat email Anda.' 
    : 'Klik tombol di bawah untuk masuk ke akun Anda.';

  return {
    subject: `${title} — Klik Link di Bawah Ini`,
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Inter,Arial,sans-serif;color:#FDFBF7;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;text-align:center;">
    <img src="${baseUrl}/shinerva-icon.png" alt="Shinerva" style="width:64px;height:64px;margin-bottom:24px;" />
    <h1 style="color:#e2725b;font-size:24px;font-weight:900;margin:0 0 8px;">${header}</h1>
    <p style="color:#8a8a8a;font-size:14px;margin:0 0 32px;">${subtitle}</p>
    <a href="${link}"
       style="display:inline-block;background:#e2725b;color:#FDFBF7;text-decoration:none;font-weight:700;font-size:16px;
              padding:14px 32px;border-radius:9999px;margin-bottom:24px;">
      ${cta}
    </a>
    <p style="color:#555;font-size:12px;margin:0 0 8px;">
      Link ini berlaku selama <strong>1 jam</strong> dan hanya untuk <strong>${toEmail}</strong>.
    </p>
    <p style="color:#444;font-size:11px;margin:0;">
      Jika Anda tidak meminta link ini, abaikan email ini.<br/>
      Dibuat oleh <strong>Shinerva AI Voice</strong>.
    </p>
  </div>
</body>
</html>`,
  };
}

// ─── 5. Option A SMTP Cascade Delivery ──────────────────────────────────────
async function sendEmailCascade({ to, subject, html }) {
  const mailOptions = { to, subject, html };
  let lastError = null;

  // Priority 1: admin@shinerva.id
  if (primaryTransport) {
    try {
      await primaryTransport.sendMail({ ...mailOptions, from: 'admin@shinerva.id' });
      logEvent('SMTP_DELIVERY', { recipient: to, sender: 'admin@shinerva.id', status: 'SUCCESS' });
      return { success: true, transport: 'admin@shinerva.id' };
    } catch (err) {
      lastError = err;
      logError('SMTP_DELIVERY', err, { recipient: to, sender: 'admin@shinerva.id', status: 'FAILED' });
    }

    // Priority 2: support@shinerva.id
    try {
      await primaryTransport.sendMail({ ...mailOptions, from: 'support@shinerva.id' });
      logEvent('SMTP_DELIVERY', { recipient: to, sender: 'support@shinerva.id', status: 'SUCCESS' });
      return { success: true, transport: 'support@shinerva.id' };
    } catch (err) {
      lastError = err;
      logError('SMTP_DELIVERY', err, { recipient: to, sender: 'support@shinerva.id', status: 'FAILED' });
    }
  }

  // Priority 3: Fallback Gmail
  if (fallbackTransport) {
    const fallbackFrom = process.env.FALLBACK_EMAIL || 'hello.shinerva@gmail.com';
    try {
      await fallbackTransport.sendMail({ ...mailOptions, from: fallbackFrom });
      logEvent('SMTP_DELIVERY', { recipient: to, sender: fallbackFrom, status: 'SUCCESS', fallback_used: true });
      return { success: true, transport: fallbackFrom };
    } catch (err) {
      lastError = err;
      logError('SMTP_DELIVERY', err, { recipient: to, sender: fallbackFrom, status: 'FAILED' });
    }
  }

  throw new Error(`All SMTP cascades failed. Last Error: ${lastError?.message || 'No transports configured'}`);
}

// ─── 6. Route Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  logEvent('API_REQUEST', { method: req.method, url: req.url, action: req.body?.action || 'signIn' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    logError('API_INVALID_BODY', 'Invalid JSON body');
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { email, continueUrl, action = 'signIn' } = body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email wajib diisi.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Format email tidak valid.' });
  }

  if (!auth) {
    logError('API_FIREBASE_UNAVAILABLE', 'Auth service not initialized');
    return res.status(503).json({ error: 'Layanan autentikasi Firebase belum aktif.' });
  }

  // Determine Target URL safely (Environment-aware)
  let targetUrl = 'https://shinerva.id'; // safe fallback
  
  try {
    // Attempt to use continueUrl from client or request origin
    const baseOrigin = req.headers.origin || req.headers.host 
      ? (req.headers.origin || `https://${req.headers.host}`)
      : process.env.APP_URL || process.env.VERCEL_URL;
      
    if (continueUrl && continueUrl.startsWith('http')) {
      targetUrl = continueUrl;
    } else if (baseOrigin) {
      targetUrl = baseOrigin.startsWith('http') ? baseOrigin : `https://${baseOrigin}`;
    }
    
    // Simple safety check against malicious redirects
    const allowedDomains = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : ['shinerva.id', 'localhost'];
    const targetDomain = new URL(targetUrl).hostname;
    const isAllowed = allowedDomains.some(d => targetDomain === d || targetDomain.endsWith(`.${d}`));
    if (!isAllowed) {
       logError('SECURITY_WARNING', `Unauthorized continueUrl requested: ${targetUrl}`);
       targetUrl = 'https://shinerva.id';
    }
  } catch (urlErr) {
    logError('URL_PARSE_ERROR', urlErr);
  }

  const actionCodeSettings = {
    url: targetUrl,
    handleCodeInApp: true,
  };

  logEvent('FIREBASE_LINK_GENERATION', { targetUrl, action, email: cleanEmail });

  let firebaseLink;
  try {
    if (action === 'verifyEmail') {
      firebaseLink = await auth.generateEmailVerificationLink(cleanEmail, actionCodeSettings);
    } else {
      firebaseLink = await auth.generateSignInWithEmailLink(cleanEmail, actionCodeSettings);
    }
    logEvent('FIREBASE_LINK_SUCCESS', { action });
  } catch (genErr) {
    logError('FIREBASE_LINK_FAILED', genErr, { code: genErr.code });
    return res.status(500).json({
      error: 'Gagal membuat link autentikasi.',
      code: genErr.code,
      detail: genErr.message,
    });
  }

  // ── 7. Send email via Cascade ──────────────────────────────────────────
  try {
    const isVerification = action === 'verifyEmail';
    const baseUrl = new URL(targetUrl).origin;
    const { subject, html } = buildMagicLinkEmail(firebaseLink, cleanEmail, isVerification, baseUrl);
    const sendResult = await sendEmailCascade({ to: cleanEmail, subject, html });
    
    return res.status(200).json({
      success: true,
      message: `Link berhasil dikirim ke ${cleanEmail}. Cek inbox atau folder Spam.`,
      transport: sendResult.transport,
    });
  } catch (sendErr) {
    return res.status(500).json({
      error: 'Gagal mengirim email.',
      detail: sendErr.message,
      suggestion: 'Sistem email sedang mengalami gangguan. Silakan coba lagi nanti.',
    });
  }
}