/**
 * SHINERVA - Admin Diagnostic Route (Test Verification Email)
 * ==========================================================
 * POST /api/admin/test-verification-email
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Simple protection for internal endpoints
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET && process.env.NODE_ENV === 'production') {
     return res.status(403).json({ error: 'Forbidden' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Target email is required' });

  const targetOrigin = req.headers.origin || `https://${req.headers.host}`;

  try {
    // 1. Pass request internally to our actual magic-link API implementation
    // This allows us to test the exact same infrastructure the user hits
    const fetchUrl = `${targetOrigin}/api/auth/magic-link`;
    const apiRes = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action: 'verifyEmail', continueUrl: targetOrigin })
    });
    
    const data = await apiRes.json();
    
    if (apiRes.ok) {
      return res.status(200).json({
        diagnostics: {
          test: 'Email Verification SMTP Cascade',
          targetUrl: targetOrigin,
          action_requested: 'verifyEmail',
          smtp_provider_used: data.transport,
          status: 'SUCCESS'
        }
      });
    } else {
      return res.status(500).json({
        diagnostics: {
          test: 'Email Verification SMTP Cascade',
          status: 'FAILED',
          error: data.error,
          detail: data.detail
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal test failure', detail: err.message });
  }
}
