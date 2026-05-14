import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getCleanEnv = (key) => {
  let val = import.meta.env[key];
  if (typeof val !== 'string') {
    if (val === undefined) return undefined;
    return String(val);
  }
  
  // Remove whitespace and potential surrounding quotes from environment managers
  let cleaned = val.trim();
  
  // Some environments might include literal quotes if not handled by the loader
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }
  
  // Remove any invisible characters (zero-width spaces, etc.)
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
  return cleaned;
};

const firebaseConfig = {
  apiKey: getCleanEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getCleanEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getCleanEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getCleanEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getCleanEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getCleanEnv('VITE_FIREBASE_APP_ID'),
};

// Diagnostics
const diagKey = firebaseConfig.apiKey;
console.log("[Firebase] Initialization Attempt:", {
  apiKeyPresent: !!diagKey,
  apiKeyType: typeof diagKey,
  apiKeyFormat: diagKey ? (diagKey.startsWith("AIza") ? "Standard (AIza...)" : "Unknown Prefix") : "Missing",
  apiKeyLength: diagKey?.length,
  projectId: firebaseConfig.projectId
});

// Optional: Custom Firestore Database ID
const firestoreDatabaseId = getCleanEnv('VITE_FIREBASE_FIRESTORE_DB_ID') || "(default)";

// Basic validation: check if all required variables are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys
  .filter(key => {
    const val = firebaseConfig[key];
    // Check for empty, undefined, or obvious placeholders
    return !val || val === "undefined" || val === "" || val === "YOUR_API_KEY" || (typeof val === 'string' && val.includes("YOUR_"));
  })
  .map(key => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase()}`);

const correctProjectId = "practical-gecko-476621-q4";
const isCorrectProject = firebaseConfig.projectId === correctProjectId;

let initError = null;
if (missingVars.length > 0) {
  initError = `Missing or default configuration values: ${missingVars.join(", ")}`;
} else if (!isCorrectProject) {
  initError = `Project ID mismatch: Expected ${correctProjectId}, found ${firebaseConfig.projectId}. Please update your VITE_FIREBASE_PROJECT_ID.`;
}

export let isConfigValid = !initError;
let app = null;
let auth = null;
let db = null;

try {
  if (isConfigValid) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("[Firebase] Initialized frontend successfully.");
    } else {
      app = getApp();
    }
    
    auth = getAuth(app);
    db = getFirestore(app, firestoreDatabaseId === "(default)" ? undefined : firestoreDatabaseId);
  } else {
    console.warn("[Firebase] Initialization skipped. Cause:", initError);
  }
} catch (error) {
  console.error("[Firebase] Fatal Init Error:", error.message);
  isConfigValid = false;
  if (error.message.includes("auth/invalid-api-key")) {
    initError = "API Key yang Anda masukkan tidak valid (auth/invalid-api-key). Silakan periksa kembali VITE_FIREBASE_API_KEY di pengaturan dashboard.";
  } else {
    initError = error.message;
  }
}

export { app, auth, db, initError };
