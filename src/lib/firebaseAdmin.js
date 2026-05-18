import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const clean = (val) => {
  if (val === null || val === undefined) return "";
  let res = String(val).trim();
  if (res === "null" || res === "undefined" || res === "") return "";
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1).trim();
  }
  return res.replace(/[\u200B-\u200D\ufeff\u00a0\u0000-\u001F\u007F-\u009F]/g, "");
};

// --- Environment and Config Setup ---
const projectId = clean(process.env.FIREBASE_PROJECT_ID);
const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// Log initialization info (sans secrets)
console.log(`[Firebase Admin] Environment Check:`);
console.log(` - PROJECT_ID: ${projectId ? "FOUND (" + projectId.length + " chars)" : "MISSING"}`);
console.log(` - CLIENT_EMAIL: ${clientEmail ? "FOUND (" + clientEmail.length + " chars)" : "MISSING"}`);
console.log(` - PRIVATE_KEY: ${rawPrivateKey ? "FOUND (" + rawPrivateKey.length + " chars)" : "MISSING"}`);

// Function to safely format private key
const formatPrivateKey = (key) => {
  if (!key || typeof key !== 'string' || key === 'undefined' || key === 'null' || key.trim() === "") return null;
  
  let formatted = key.trim();
  
  // Remove surrounding quotes
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.substring(1, formatted.length - 1);
  }
  if (formatted.startsWith("'") && formatted.endsWith("'")) {
    formatted = formatted.substring(1, formatted.length - 1);
  }

  // Replace literal \n with actual newlines
  formatted = formatted.replace(/\\n/g, '\n');
  
  // Add headers if missing
  if (!formatted.includes('-----BEGIN PRIVATE KEY-----')) {
    formatted = `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----\n`;
  }
  
  return formatted;
};

const privateKey = formatPrivateKey(rawPrivateKey);

let app;

// Initialize Admin SDK
if (projectId && clientEmail && privateKey) {
  try {
    const existingApp = admin.apps.find(a => a.options.projectId === projectId);
    if (existingApp) {
      app = existingApp;
    } else {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId
      });
      console.log(`[Firebase Admin] Initialized successfully for project: ${projectId}`);
    }
  } catch (error) {
    console.error(`[Firebase Admin] Initialization failed: ${error.message}`);
  }
} else {
  const missing = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
  console.error(`[Firebase Admin] MISSING CREDENTIALS: ${missing.join(", ")}`);
}

export const authAdmin = app ? admin.auth(app) : null;
export const dbAdmin = app ? admin.firestore(app) : null;
export default admin;
