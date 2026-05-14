import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// We can use the JSON file directly in Vite
import localConfig from "../../firebase-applet-config.json";

const getEnv = (key, fallback) => {
  const val = import.meta.env[key];
  // Prioritize env vars over localConfig if they are present and valid
  return (val && typeof val === 'string' && val !== "" && val !== "undefined") ? val.trim() : fallback;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', localConfig.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', localConfig.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', localConfig.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', localConfig.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', localConfig.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', localConfig.appId),
};

// Optional: Custom Firestore Database ID
const firestoreDatabaseId = getEnv('VITE_FIREBASE_FIRESTORE_DB_ID', localConfig.firestoreDatabaseId) || "(default)";

// Basic validation: check if all required variables are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys
  .filter(key => {
    const val = firebaseConfig[key];
    return !val || val === "undefined" || val === "" || val === null;
  })
  .map(key => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase()}`);

// Additional project ID validation
const correctProjectId = "practical-gecko-476621-q4";
const isCorrectProject = firebaseConfig.projectId === correctProjectId;

export let isConfigValid = missingVars.length === 0;
export let initError = null;

if (!isConfigValid) {
  if (missingVars.length > 0) {
    console.error(`[Firebase] ERROR: Missing environment variables: ${missingVars.join(", ")}`);
  }
  if (firebaseConfig.projectId && !isCorrectProject) {
    console.error(`[Firebase] ERROR: Project ID mismatch. Expected ${correctProjectId}, got ${firebaseConfig.projectId}`);
  }
  console.warn("[Firebase] Verification failed. Check your .env or AI Studio Settings.");
}

let app = null;
let auth = null;
let db = null;

try {
  if (isConfigValid) {
    if (!getApps().length) {
      console.log(`[Firebase] Attempting init with Project ID: ${firebaseConfig.projectId}`);
      console.log(`[Firebase] API Key hint: ${firebaseConfig.apiKey?.substring(0, 5)}... (Length: ${firebaseConfig.apiKey?.length})`);
      app = initializeApp(firebaseConfig);
      console.log("[Firebase] App initialized successfully for project:", firebaseConfig.projectId);
    } else {
      app = getApp();
    }
    
    // Explicitly check for successful app before auth/db
    if (app) {
      auth = getAuth(app);
      db = getFirestore(app, firestoreDatabaseId === "(default)" ? undefined : firestoreDatabaseId);
      console.log("[Firebase] Auth and Firestore initialized.");
    }
  } else {
    console.warn("[Firebase] Initialization skipped due to invalid configuration.");
  }
} catch (error) {
  console.error("[Firebase] CRITICAL ERROR during initialization:", error.message);
  initError = error.message;
  isConfigValid = false; 
}

export { app, auth, db };
