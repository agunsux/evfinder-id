require('dotenv').config();
const vars = [
  'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY',
  'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS',
  'FALLBACK_EMAIL', 'FALLBACK_EMAIL_PASSWORD',
  'APP_URL', 'ALLOWED_DOMAINS', 'ADMIN_SECRET'
];
console.log('--- STEP 1 ---');
vars.forEach(v => console.log(`${v}: ${process.env[v] ? 'FOUND' : 'MISSING'}`));
