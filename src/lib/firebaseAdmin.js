import admin from 'firebase-admin';

// --- Environment and Config Setup ---
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

const correctProjectId = "practical-gecko-476621-q4";

if (!projectId || projectId !== correctProjectId) {
  console.error(`[Firebase Admin] CRITICAL: Project ID mismatch or missing. Expected ${correctProjectId}, got ${projectId}`);
}

// Function to safely format private key
const formatPrivateKey = (key) => {
  if (!key || typeof key !== 'string' || key === 'undefined' || key === 'null') return null;
  
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
  console.error("[Firebase Admin] MISSING CREDENTIALS: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
}

export const authAdmin = app ? admin.auth(app) : null;
export const dbAdmin = app ? admin.firestore(app) : null;
export default admin;
