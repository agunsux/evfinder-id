export default function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const whitelist = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const userEmail = (req.user.email || '').toLowerCase();
  const isAdmin = whitelist.includes(userEmail);
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
}
