/**
 * SHINERVA - Server-Side Magic Link Email API Route
 * ==================================================
 * POST /api/auth/magic-link
 *
 * Server-side magic link handler — generates Firebase Admin SDK
 * sign-in link and sends via robust SMTP→Gmail cascade.
 *
 * Flow:
 *  1. Parse + validate email
 *  2. Generate magic link via Firebase Admin SDK (server-side)
 *  3. Send via primary SMTP → fallback Gmail
 *  4. Return success/error status
 *
 * Requires env vars:
 *  EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 *  FALLBACK_EMAIL, FALLBACK_EMAIL_PASSWORD
 *  FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// ─── Firebase Admin Init ────────────────────────────────────────────────────
let auth = null;

function initFirebase() {
  if (auth) return;
  try {
    if (admin.apps.length > 0) {
      auth = admin.auth();
      console.log('[Magic Link] Firebase Admin Auth initialized');
    } else {
      // Fallback: minimal init for environments where firebaseAdmin is already loaded
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
        console.log('[Magic Link] Firebase Admin Auth initialized from env');
      }
    }
  } catch (err) {
    console.error('[Magic Link] Firebase Admin init failed:', err.message);
  }
}

initFirebase();

// ─── Transporter Setup ───────────────────────────────────────────────────────
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
    console.log('[Magic Link] Primary SMTP transport ready');
  } else {
    console.warn('[Magic Link] Primary SMTP not configured');
  }

  if (process.env.FALLBACK_EMAIL && process.env.FALLBACK_EMAIL_PASSWORD) {
    fallbackTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.FALLBACK_EMAIL, pass: process.env.FALLBACK_EMAIL_PASSWORD },
      pool: true, maxConnections: 3,
      connectionTimeout: 15000, socketTimeout: 30000,
    });
    console.log('[Magic Link] Fallback Gmail transport ready');
  } else {
    console.warn('[Magic Link] Fallback Gmail not configured');
  }
}

initTransports();

// ─── Email Templates ────────────────────────────────────────────────────────
function buildMagicLinkEmail(link, toEmail) {
  return {
    subject: 'Masuk ke Shinerva — Klik Link di Bawah Ini',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Masuk Shinerva</title>
</head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Inter,Arial,sans-serif;color:#FDFBF7;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;text-align:center;">
    <img src="https://langgam.vercel.app/shinerva-icon.png" alt="Shinerva" style="width:64px;height:64px;margin-bottom:24px;" />
    <h1 style="color:#e2725b;font-size:24px;font-weight:900;margin:0 0 8px;">Masuk ke Shinerva</h1>
    <p style="color:#8a8a8a;font-size:14px;margin:0 0 32px;">Klik tombol di bawah untuk masuk ke akun Anda.</p>
    <a href="${link}"
       style="display:inline-block;background:#e2725b;color:#FDFBF7;text-decoration:none;font-weight:700;font-size:16px;
              padding:14px 32px;border-radius:9999px;margin-bottom:24px;">
      Masuk Sekarang
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

// ─── Send with Primary→Fallback Cascade ──────────────────────────────────────
async function sendEmailWithFallback({ to, subject, html }) {
  const primaryUser = process.env.EMAIL_USER || '';
  const allowedPrimary = ['admin@shinerva.id', 'support@shinerva.id'];
  const fromAddress = process.env.EMAIL_FROM
    || (allowedPrimary.includes(primaryUser) ? primaryUser : 'support@shinerva.id');

  const mailOptions = { from: fromAddress, to, subject, html };

  // ── Try primary SMTP ────────────────────────────────────────────────────
  if (primaryTransport) {
    try {
      await primaryTransport.sendMail(mailOptions);
      console.log(`[Magic Link] ✓ Sent via primary SMTP (${fromAddress}) → ${to}`);
      return { success: true, transport: 'primary SMTP' };
    } catch (primaryErr) {
      console.warn(`[Magic Link] Primary SMTP failed for ${to}: ${primaryErr.message} (code: ${primaryErr.code})`);
      
      const isAuthErr = primaryErr.code === 'EAUTH' || primaryErr.message?.includes('Authentication') || primaryErr.responseCode === 535;
      if (isAuthErr) {
        console.warn('[Magic Link] Primary SMTP auth error — permanently disabling primary transport');
        primaryTransport = null;
      }
      
      console.log('[Magic Link] Triggering global fallback mechanism...');
      // Proceed to Gmail fallback immediately
    }
  } else {
    console.warn('[Magic Link] Primary SMTP not available or disabled — trying fallback');
  }

  // ── Fallback Gmail ────────────────────────────────────────────────────────
  if (fallbackTransport) {
    try {
      // Override from address for Gmail fallback, but keep exact same template structure
      const fallbackFrom = process.env.FALLBACK_EMAIL || 'hello.shinerva@gmail.com';
      const gmailOptions = { ...mailOptions, from: fallbackFrom };
      
      await fallbackTransport.sendMail(gmailOptions);
      console.log(`[Magic Link] ✓ Sent via fallback Gmail (${fallbackFrom}) → ${to}`);
      return { success: true, transport: 'fallback Gmail' };
    } catch (fallbackErr) {
      console.error(`[Magic Link] Fallback Gmail also failed for ${to}: ${fallbackErr.message}`);
      throw new Error(`Gagal mengirim email. Silakan coba lagi atau hubungi support. (${fallbackErr.message})`);
    }
  }

  throw new Error('Tidak ada layanan email yang aktif. Pastikan SMTP atau Gmail sudah dikonfigurasi.');
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Parse & validate body ────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { email, continueUrl } = body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email wajib diisi.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Format email tidak valid.' });
  }

  // ── 2. Generate magic link via Firebase Admin ───────────────────────────
  if (!auth) {
    return res.status(503).json({ error: 'Layanan autentikasi Firebase belum aktif.' });
  }

  let magicLink;
  try {
    const targetUrl = continueUrl
      || process.env.EMAIL_CONTINUE_URL
      || 'https://langgam.vercel.app';

    const actionCodeSettings = {
      url: targetUrl,
      handleCodeInApp: true,
    };

    magicLink = await auth.generateSignInWithEmailLink(cleanEmail, actionCodeSettings);
    console.log(`[Magic Link] Generated for ${cleanEmail}`);
  } catch (genErr) {
    console.error(`[Magic Link] Generate failed for ${cleanEmail}:`, genErr.message);
    return res.status(500).json({
      error: 'Gagal membuat link masuk.',
      detail: genErr.message,
    });
  }

  // ── 3. Send email via best available transport ─────────────────────────
  try {
    const { subject, html } = buildMagicLinkEmail(magicLink, cleanEmail);
    const sendResult = await sendEmailWithFallback({ to: cleanEmail, subject, html });

    return res.status(200).json({
      success: true,
      message: `Link masuk dikirim ke ${cleanEmail}. Cek inbox atau folder Spam.`,
      transport: sendResult.transport,
    });
  } catch (sendErr) {
    console.error(`[Magic Link] Send failed for ${cleanEmail}:`, sendErr.message);
    return res.status(500).json({
      error: 'Gagal mengirim email.',
      detail: sendErr.message,
      suggestion: 'Coba periksa folder Spam, atau tunggu beberapa menit lalu coba lagi.',
    });
  }
}