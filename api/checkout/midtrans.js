/**
 * SHINERVA - Isolated Midtrans Checkout Route
 * ========================================
 * POST /api/checkout/midtrans
 *
 * ZERO dependency on AI/TTS/Gemini/R2/voice generation.
 * This route ONLY handles Midtrans Snap token generation.
 *
 * If GEMINI_API_KEY is missing, this route still works perfectly.
 * If R2 is unconfigured, this route still works perfectly.
 *
 * Flow:
 *  1. Authenticate user (Firebase ID token)
 *  2. Validate planId against PLANS
 *  3. Generate Midtrans Snap token (sandbox or production based on env)
 *  4. Return token to frontend → window.snap.pay(token) opens modal
 *
 * Required env vars (payment-only — NO AI vars needed):
 *   MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION
 */

import crypto from 'crypto';
import admin from 'firebase-admin';
import midtransClient from 'midtrans-client';
import { PLANS } from '../../src/lib/plans.js';

// ─── Firebase Admin Init ────────────────────────────────────────────────────
let auth = null;
let db = null;

function initFirebase() {
  if (auth) return;
  try {
    if (admin.apps.length > 0) {
      const app = admin.apps[0];
      auth = admin.auth(app);
      db = admin.firestore(app);
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawKey) {
      console.error('[Checkout] Firebase credentials missing');
      return;
    }

    const fmt = (k) => {
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
        privateKey: fmt(rawKey),
        private_key: fmt(rawKey)
      }),
      projectId,
    });
    auth = admin.auth(app);
    db = admin.firestore(app);
    console.log('[Checkout] Firebase Admin initialized');
  } catch (err) {
    console.error('[Checkout] Firebase init failed:', err.message);
  }
}

initFirebase();

// ─── Midtrans Snap Init ──────────────────────────────────────────────────
let snapClient = null;

function getSnapClient() {
  if (snapClient) return snapClient;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;

  if (!serverKey || !clientKey) {
    throw Object.assign(new Error('MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY belum diset di environment variables.'), {
      code: 'MIDTRANS_NOT_CONFIGURED',
      status: 503,
    });
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  snapClient = new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });

  console.log(`[Checkout] Midtrans Snap initialized (${isProduction ? 'PRODUCTION' : 'SANDBOX'})`);
  return snapClient;
}

// ─── Token Verification ─────────────────────────────────────────────────
async function verifyFirebaseToken(bearerToken) {
  if (!auth) {
    throw Object.assign(new Error('Layanan autentikasi belum aktif.'), { code: 'AUTH_NOT_READY', status: 503 });
  }
  if (!bearerToken || bearerToken === 'null' || bearerToken === 'undefined') {
    throw Object.assign(new Error('Token autentikasi tidak ditemukan.'), { code: 'TOKEN_MISSING', status: 401 });
  }

  try {
    const decoded = await auth.verifyIdToken(bearerToken);
    const uid = decoded.uid;

    // Get user email (may not be in token)
    let email = decoded.email;
    if (!email) {
      try {
        const firebaseUser = await auth.getUser(uid);
        email = firebaseUser.email;
      } catch (_) {}
    }
    if (!email) {
      email = `user-${uid}@placeholder.shinerva.id`;
    }

    // Fetch Firestore user data
    let userData = null;
    if (db) {
      try {
        const doc = await db.collection('users').doc(uid).get();
        userData = doc.exists ? doc.data() : null;
      } catch (_) {}
    }

    return { uid, email, userData };
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      throw Object.assign(new Error('Sesi login Anda sudah expired. Silakan login ulang.'), { code: 'TOKEN_EXPIRED', status: 401 });
    }
    if (err.code === 'auth/argument-error') {
      throw Object.assign(new Error('Token autentikasi tidak valid.'), { code: 'TOKEN_INVALID', status: 401 });
    }
    throw Object.assign(new Error('Autentikasi gagal: ' + err.message), { code: 'AUTH_FAILED', status: 401 });
  }
}

// ─── Plan Validation ────────────────────────────────────────────────────
function validatePlan(planId, billingCycle) {
  const plan = Object.values(PLANS).find(p => p.id === planId);
  if (!plan) {
    const available = Object.keys(PLANS).join(', ');
    throw Object.assign(
      new Error(`Paket "${planId}" tidak ditemukan. Paket tersedia: ${available}.`),
      { code: 'PLAN_NOT_FOUND', status: 400 }
    );
  }

  const price = billingCycle === 'yearly' && plan.yearlyPrice
    ? plan.yearlyPrice
    : plan.price;

  return { plan, price };
}

// ─── Build Snap Payload ───────────────────────────────────────────────
function buildSnapPayload({ orderId, price, plan, user, billingCycle, host }) {
  const customerDetails = {
    first_name: user?.name || 'Shinerva User',
    email: user?.email || 'unknown@placeholder.shinerva.id',
    phone: user?.whatsapp || '',
  };

  return {
    transaction_details: {
      order_id: orderId,
      gross_amount: price,
    },
    customer_details: customerDetails,
    item_details: [
      {
        id: plan.id,
        price,
        quantity: 1,
        name: `Shinerva ${plan.name}${billingCycle === 'yearly' ? ' (Tahunan)' : ''}`,
      },
    ],
    metadata: {
      uid: user?.uid || 'unknown',
      plan_id: plan.id,
      plan_name: plan.name,
      billing_cycle: billingCycle || 'monthly',
      credits: plan.credits,
    },
    enabled_payments: [
      'gopay', 'shopeepay', 'ovo', 'dana', 'linkaja', 'qris',
      'bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'other_va',
    ],
    callbacks: {
      finish: `https://${host}/settings`,
    },
  };
}

// ─── Route Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Backend-Server', 'Shinerva');
  res.setHeader('X-Pipeline', 'checkout');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const { planId, billingCycle = 'monthly' } = body || {};

  // ── 1. Authenticate ────────────────────────────────────────────────
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Autentikasi diperlukan.',
      code: 'AUTH_REQUIRED',
      suggestion: 'Silakan login terlebih dahulu sebelum membeli paket.',
    });
  }

  const idToken = authHeader.slice(7);
  let userAuth;
  try {
    userAuth = await verifyFirebaseToken(idToken);
  } catch (err) {
    console.error('[Checkout] Auth error:', err.message);
    return res.status(err.status || 401).json({
      error: err.message,
      code: err.code || 'AUTH_ERROR',
    });
  }

  // ── 2. Validate Plan ──────────────────────────────────────────────
  let plan, price;
  try {
    ({ plan, price } = validatePlan(planId, billingCycle));
  } catch (err) {
    return res.status(err.status || 400).json({
      error: err.message,
      code: err.code || 'VALIDATION_ERROR',
    });
  }

  // ── 3. Generate Order ID ───────────────────────────────────────────
  const orderId = `SHINERVA-${userAuth.uid}-${planId.toUpperCase()}-${Date.now()}`;

  // ── 4. Build Midtrans Payload ────────────────────────────────────
  let snapPayload;
  try {
    snapPayload = buildSnapPayload({
      orderId,
      price,
      plan,
      user: userAuth,
      billingCycle,
      host: req.get('host') || (process.env.APP_URL ? new URL(process.env.APP_URL).hostname : 'shinerva.id'),
    });
  } catch (err) {
    console.error('[Checkout] Payload build error:', err);
    return res.status(500).json({
      error: 'Gagal membangun detail pembayaran.',
      code: 'PAYLOAD_ERROR',
    });
  }

  // ── 5. Get Midtrans Snap Token ────────────────────────────────────
  let snapToken, redirectUrl;
  try {
    const snap = getSnapClient();
    console.log(`[Checkout] Creating Snap transaction for ${userAuth.email} — plan: ${plan.name}, price: ${price}`);

    const transaction = await snap.createTransaction(snapPayload);
    snapToken = transaction.token;
    redirectUrl = transaction.redirect_url;

    if (!snapToken) {
      throw Object.assign(new Error('Midtrans tidak mengembalikan token.'), { code: 'NO_TOKEN' });
    }

    console.log(`[Checkout] Token generated: ${orderId}`);
  } catch (err) {
    console.error('[Checkout] Midtrans error:', err.message);

    // Specific Midtrans error codes
    const midtransMsg = err.message || '';
    if (midtransMsg.includes('invalid') || midtransMsg.includes('credential')) {
      return res.status(502).json({
        error: 'Konfigurasi Midtrans tidak valid. Hubungi support.',
        code: 'MIDTRANS_CRED_ERROR',
        detail: err.message,
      });
    }
    if (midtransMsg.includes('timeout') || err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Midtrans sedang tidak tersedia. Silakan coba lagi dalam beberapa menit.',
        code: 'MIDTRANS_UNAVAILABLE',
      });
    }

    return res.status(502).json({
      error: err.message || 'Gagal membuat transaksi Midtrans.',
      code: 'MIDTRANS_ERROR',
    });
  }

  // ── 6. Return Token ───────────────────────────────────────────────
  console.log(`[Checkout] ✓ Success for ${userAuth.email} — order: ${orderId}`);

  return res.status(200).json({
    success: true,
    token: snapToken,
    redirectUrl: redirectUrl || null,
    orderId,
    plan: {
      id: plan.id,
      name: plan.name,
      price,
      credits: plan.credits,
    },
    message: 'Token pembayaran berhasil dibuat.',
  });
}
