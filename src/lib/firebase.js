import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const clean = (val) => {
  if (typeof val !== 'string') return val;
  let cleaned = val.trim();
  // Remove possible quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }
  // Remove invisible characters
  return cleaned.replace(/[\u200B-\u200D\uFEFF]/g, "");
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
};

// Optional: Custom Firestore Database ID
const firestoreDatabaseId = clean(import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID) || "(default)";

// Basic validation
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys.filter(key => {
  const val = firebaseConfig[key];
  return !val || val === "undefined" || val === "" || (typeof val === 'string' && val.length < 5);
});

const correctProjectId = "practical-gecko-476621-q4";
const isCorrectProject = firebaseConfig.projectId === correctProjectId;

let initError = null;
if (missingVars.length > 0) {
  initError = `Missing required environment variables: ${missingVars.join(", ")}`;
} else if (!isCorrectProject) {
  initError = `Project ID mismatch: Expected ${correctProjectId}, got ${firebaseConfig.projectId}. Please check VITE_FIREBASE_PROJECT_ID in settings.`;
}

export let isConfigValid = !initError;
let app = null;
let auth = null;
let db = null;

try {
  // Runtime Diagnostic Logs
  const keyToLog = firebaseConfig.apiKey || "";
  console.log("[Firebase] Runtime Diagnostic:", {
    keyPresent: !!keyToLog,
    keyLength: keyToLog.length,
    keyStart: keyToLog.slice(0, 7),
    keyEnd: keyToLog.slice(-4),
    projectId: firebaseConfig.projectId,
    isCorrectProject,
    envMode: import.meta.env.MODE,
    hasHiddenChars: /[\u200B-\u200D\uFEFF]/.test(import.meta.env.VITE_FIREBASE_API_KEY || "")
  });

  if (isConfigValid) {
    if (!getApps().length) {
      console.log("[Firebase] Attempting initializeApp...");
      app = initializeApp(firebaseConfig);
      console.log("[Firebase] initializeApp successful.");
    } else {
      app = getApp();
    }
    
    auth = getAuth(app);
    db = getFirestore(app, firestoreDatabaseId === "(default)" ? undefined : firestoreDatabaseId);
    
    console.log("[Firebase] Frontend services successfully attached to App.");
  } else {
    console.error("[Firebase] Initialization aborted due to config error:", initError);
    // Expose keys for manual verification if invalid
    if (!isCorrectProject || missingVars.length > 0) {
       console.log("[Firebase] Debug Info:", {
          rawProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          expectedProjectId: correctProjectId,
          rawApiKeyPrefix: import.meta.env.VITE_FIREBASE_API_KEY?.slice(0, 5)
       });
    }
  }
} catch (error) {
  console.error("[Firebase] Fatal Initialization Error:", error.message);
  console.error("Firebase Error Code:", error.code);
  isConfigValid = false;
  
  const rawKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
  const diagnosticDetails = `Key: ${rawKey.slice(0, 6)}...${rawKey.slice(-4)} (Len: ${rawKey.length}). Project: ${firebaseConfig.projectId}.`;

  if (error.code === "auth/invalid-api-key" || error.message.includes("invalid-api-key")) {
    initError = `API Key tidak valid (auth/invalid-api-key). ${diagnosticDetails} Pastikan VITE_FIREBASE_API_KEY di Settings benar.`;
  } else {
    initError = `Error: ${error.message} (${error.code || 'n/a'}). ${diagnosticDetails}`;
  }
}

export { app, auth, db, initError };
