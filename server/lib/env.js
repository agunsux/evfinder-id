import dotenv from 'dotenv';
dotenv.config();

export function validateEnv() {
  const requiredVars = [
    'GEMINI_API_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_DOMAIN',
    'TURNSTILE_SECRET_KEY',
    'VITE_TURNSTILE_SITE_KEY'
  ];

  let missing = [];

  for (const v of requiredVars) {
    if (!process.env[v]) {
      missing.push(v);
    }
  }

  if (missing.length > 0) {
    console.error(`[Startup Validation Failed] Missing required environment variables:`);
    missing.forEach(m => console.error(` - ${m}`));
    console.error("Please configure these in your .env file or environment settings.");
    
    if (process.env.NODE_ENV === 'production') {
      console.error("Exiting due to strict production validation.");
      process.exit(1);
    } else {
      console.warn("Continuing in development mode, but features relying on these variables will fail.");
    }
  } else {
    console.log("[Startup] All required environment variables are present.");
  }
}
