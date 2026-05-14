import admin from 'firebase-admin';

// --- Environment and Config Setup ---
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log(`[Firebase] Configuring for Project ID: ${projectId}`);

// Function to safely format private key
const formatPrivateKey = (key) => {
  if (!key || typeof key !== 'string' || key === 'undefined' || key === 'null') return undefined;
  let formatted = key.replace(/\\n/g, '\n');
  if (!formatted.includes('-----BEGIN PRIVATE KEY-----')) {
    formatted = `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----\n`;
  }
  return formatted;
};

const privateKey = formatPrivateKey(rawPrivateKey);

const adminConfig = { projectId };

if (clientEmail && privateKey) {
  // Use individual fields from environment variables
  try {
    adminConfig.credential = admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    });
    console.log(`[Firebase] Initialized with individual credentials from environment variables for project: ${projectId}`);
  } catch (error) {
    console.error(`[Firebase] Failed to initialize with individual credentials: ${error.message}`);
  }
}

if (!adminConfig.credential) {
  console.log(`[Firebase] No environment credentials found. Falling back to Application Default Credentials (ADC).`);
}

let app;
const existingApp = admin.apps.find(a => a.name === 'SHINERVA_BACKEND' || a.options.projectId === projectId);

if (existingApp) {
  app = existingApp;
  console.log(`[Firebase] Using existing Admin SDK app for project: ${app.options.projectId}`);
} else {
  // If there's a default app but it's the wrong project, we use a named app
  try {
    const defaultApp = admin.app();
    if (defaultApp.options.projectId === projectId) {
      app = defaultApp;
      console.log(`[Firebase] Using default Admin SDK app for project: ${projectId}`);
    } else {
      app = admin.initializeApp(adminConfig, 'SHINERVA_BACKEND');
      console.log(`[Firebase] Initialized named Admin SDK app for project: ${projectId}`);
    }
  } catch (e) {
    app = admin.initializeApp(adminConfig);
    console.log(`[Firebase] Initialized default Admin SDK app for project: ${projectId}`);
  }
}

export const authAdmin = admin.auth(app);
export const dbAdmin = admin.firestore(app);
export default admin;
