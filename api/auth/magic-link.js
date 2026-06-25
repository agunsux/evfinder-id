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
      const cleanEnvVar = (val) => {
        if (!val) return val;
        let s = val.trim();
        if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
        if (s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1);
        return s.trim();
      };

      const projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
      const clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
      const rawPrivateKey = cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY);

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
            projectId: projectId,
            project_id: projectId,
            clientEmail: clientEmail,
            client_email: clientEmail,
            privateKey: formatKey(rawPrivateKey),
            private_key: formatKey(rawPrivateKey),
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
// ─── 3. Transporter Setup ───────────────────────────────────────────────────
let primaryTransport = null;
let fallbackTransport = null;
let gmailTransport = null;

let primaryFrom = '';
let fallbackFrom = '';
let gmailFrom = '';

function initTransports() {
  // Normalize variable names internally
  const primaryHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const primaryPort = Number(process.env.EMAIL_PORT) || Number(process.env.SMTP_PORT) || 587;
  const primarySecure = process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true';
  const primaryUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const primaryPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const primaryEmailFrom = process.env.EMAIL_FROM || process.env.SMTP_FROM || primaryUser;

  const fallbackHost = process.env.FALLBACK_SMTP_HOST || process.env.FALLBACK_HOST;
  const fallbackPort = Number(process.env.FALLBACK_SMTP_PORT) || Number(process.env.FALLBACK_PORT) || 587;
  const fallbackSecure = process.env.FALLBACK_SMTP_SECURE === 'true' || process.env.FALLBACK_SECURE === 'true';
  const fallbackUser = process.env.FALLBACK_SMTP_USER || process.env.FALLBACK_USER;
  const fallbackPass = process.env.FALLBACK_SMTP_PASS || process.env.FALLBACK_PASS;
  const fallbackEmailFrom = process.env.FALLBACK_SMTP_FROM || process.env.FALLBACK_FROM || fallbackUser;

  const gmailUser = process.env.FALLBACK_EMAIL || process.env.GMAIL_USER;
  const gmailPass = process.env.FALLBACK_EMAIL_PASSWORD || process.env.GMAIL_PASS;

  // Primary SMTP Transporter
  if (primaryHost && primaryUser && primaryPass) {
    primaryTransport = nodemailer.createTransport({
      host: primaryHost,
      port: primaryPort,
      secure: primarySecure,
      auth: { user: primaryUser, pass: primaryPass },
      pool: true, maxConnections: 5,
      connectionTimeout: 15000, socketTimeout: 30000,
    });
    primaryFrom = primaryEmailFrom;
    logEvent('SMTP_INIT_PRIMARY', { status: 'READY', host: primaryHost, user: primaryUser });
  }

  // Secondary/Fallback SMTP Transporter
  if (fallbackHost && fallbackUser && fallbackPass) {
    fallbackTransport = nodemailer.createTransport({
      host: fallbackHost,
      port: fallbackPort,
      secure: fallbackSecure,
      auth: { user: fallbackUser, pass: fallbackPass },
      pool: true, maxConnections: 3,
      connectionTimeout: 15000, socketTimeout: 30000,
    });
    fallbackFrom = fallbackEmailFrom;
    logEvent('SMTP_INIT_FALLBACK', { status: 'READY', host: fallbackHost, user: fallbackUser });
  }

  // Backup Gmail Transporter
  if (gmailUser && gmailPass) {
    gmailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
      pool: true, maxConnections: 3,
      connectionTimeout: 15000, socketTimeout: 30000,
    });
    gmailFrom = gmailUser;
    logEvent('SMTP_INIT_GMAIL', { status: 'READY', user: gmailUser });
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

// ─── 5. SMTP Cascade Delivery ──────────────────────────────────────────────
async function sendEmailCascade({ to, subject, html }) {
  const mailOptions = { to, subject, html };
  let lastError = null;

  // Cascade list
  const cascadeList = [
    { transport: primaryTransport, name: 'primary', from: primaryFrom },
    { transport: fallbackTransport, name: 'fallback', from: fallbackFrom },
    { transport: gmailTransport, name: 'gmail', from: gmailFrom }
  ];

  for (const item of cascadeList) {
    if (item.transport) {
      try {
        logEvent('SMTP_VERIFY_START', { transport: item.name });
        await item.transport.verify();
        logEvent('SMTP_VERIFY_SUCCESS', { transport: item.name });
        
        await item.transport.sendMail({ ...mailOptions, from: item.from });
        logEvent('SMTP_DELIVERY_SUCCESS', { recipient: to, sender: item.from, transport: item.name });
        return { success: true, transport: item.from };
      } catch (err) {
        lastError = err;
        logError('SMTP_DELIVERY_FAILED', err, { recipient: to, transport: item.name });
      }
    }
  }

  const isAnyConfigured = !!(primaryTransport || fallbackTransport || gmailTransport);
  if (!isAnyConfigured) {
    throw new Error('Email service is not configured');
  }

  throw new Error(lastError?.message || 'SMTP delivery failed on all configurations');
}

// ─── 6. Route Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  logEvent('API_REQUEST', { method: req.method, url: req.url, action: req.body?.action || 'signIn' });

  const isAnyConfigured = !!(primaryTransport || fallbackTransport || gmailTransport);
  if (!isAnyConfigured) {
    logError('SMTP_NOT_CONFIGURED', 'No active mail transporter initialized');
    return res.status(503).json({ error: "Email service is not configured" });
  }

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
      : process.env.APP_URL || process.env.VERCEL_URL || 'https://shinerva.id';
      
    if (continueUrl && continueUrl.startsWith('http')) {
      targetUrl = continueUrl;
    } else if (baseOrigin) {
      targetUrl = baseOrigin.startsWith('http') ? baseOrigin : `https://${baseOrigin}`;
    }
    
    // Simple safety check against malicious redirects
    let allowedDomains = ['shinerva.id'];
    if (process.env.ALLOWED_DOMAINS) {
      allowedDomains = process.env.ALLOWED_DOMAINS.split(',').map(d => d.trim());
    } else if (process.env.NODE_ENV !== 'production') {
      allowedDomains.push('localhost');
      allowedDomains.push('127.0.0.1');
    }
    
    const targetDomain = new URL(targetUrl).hostname;
    const isAllowed = allowedDomains.some(d => targetDomain === d || targetDomain.endsWith(`.${d}`));
    if (!isAllowed) {
       logError('SECURITY_WARNING', `Unauthorized continueUrl requested: ${targetUrl}`);
       targetUrl = 'https://shinerva.id';
    }
  } catch (urlErr) {
    logError('URL_PARSE_ERROR', urlErr);
    targetUrl = 'https://shinerva.id';
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