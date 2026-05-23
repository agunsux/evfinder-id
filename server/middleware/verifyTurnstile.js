import fetch from 'node-fetch';

export async function verifyTurnstile(req, res, next) {
  const token = req.body?.turnstileToken || req.headers['x-turnstile-token'];

  // In development, if the secret is not configured and token is dummy, we can optionally bypass,
  // but to be secure by default we should require it unless explicitly overridden.
  if (!token) {
    console.warn(`[Turnstile] Request missing token from IP ${req.ip}`);
    return res.status(403).json({ error: 'Verifikasi keamanan gagal: Token tidak ditemukan.', code: 'TURNSTILE_MISSING' });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("[Turnstile] TURNSTILE_SECRET_KEY is missing. Bypassing check in dev mode.");
      return next();
    }
    console.error("[Turnstile] TURNSTILE_SECRET_KEY is missing in production.");
    return res.status(500).json({ error: 'Konfigurasi server tidak valid.', code: 'SERVER_ERROR' });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', req.ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });

    const outcome = await response.json();
    
    if (outcome.success) {
      return next();
    } else {
      console.warn(`[Turnstile] Verification failed for IP ${req.ip}:`, outcome['error-codes']);
      return res.status(403).json({ error: 'Verifikasi keamanan gagal.', code: 'TURNSTILE_FAILED' });
    }
  } catch (error) {
    console.error("[Turnstile] Verification request failed:", error);
    return res.status(500).json({ error: 'Kesalahan saat verifikasi keamanan.', code: 'TURNSTILE_ERROR' });
  }
}
