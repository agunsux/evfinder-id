import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const clean = (val) => {
  if (val === null || val === undefined) return "";
  let res = String(val).trim();
  if (res === "null" || res === "undefined" || res === "") return "";
  
  // Remove potential surrounding quotes (both single and double)
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1).trim();
  }
  
  // Remove hidden characters and control characters
  return res.replace(/[\u200B-\u200D\ufeff\u00a0\u0000-\u001F\u007F-\u009F]/g, "");
};

// Use environment variables or hardcoded fallbacks for this specific project
// Note: Hardcoded fallbacks are for development convenience when env vars might be stale in browser cache
const rawApiKey = clean(import.meta.env.VITE_FIREBASE_API_KEY);
const rawProjectId = clean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  // If the secret starts with '{', someone likely pasted a Service Account JSON by mistake.
  // We filter it out so the fallback takes over.
  apiKey: (rawApiKey && !rawApiKey.startsWith("{")) ? rawApiKey : "AIzaSyAGWJz9SS1nBlMjx7bb7i7lx9LaBJNYmMM",
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "practical-gecko-476621-q4.firebaseapp.com",
  projectId: rawProjectId || "practical-gecko-476621-q4",
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "practical-gecko-476621-q4.firebasestorage.app",
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "240392759669",
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID) || "1:240392759669:web:f7a716bdd379422227cb3c",
};

const firestoreDatabaseId = clean(import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID) || "ai-studio-305f7bca-107e-4ee8-bbb4-57fef0edffb6";

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys.filter(key => !firebaseConfig[key]);

const correctProjectId = "practical-gecko-476621-q4";
const isCorrectProject = !firebaseConfig.projectId || firebaseConfig.projectId === correctProjectId;

let initError = null;
if (missingVars.length > 0) {
  initError = `Missing required environment variables: ${missingVars.join(", ")}.`;
} else if (!isCorrectProject) {
  initError = `Project ID mismatch: Expected ${correctProjectId}, got ${firebaseConfig.projectId}.`;
}

export let isConfigValid = !initError;
let app = null;
let auth = null;
let db = null;

try {
  if (isConfigValid) {
    const existingApps = getApps();
    if (!existingApps.length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = existingApps[0];
    }
    
    auth = getAuth(app);
    console.log("[Firebase] Auth initialized for domain:", firebaseConfig.authDomain);
    
    // Explicitly set persistence to local with gracefull fallback
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.warn("[Firebase] Local persistence failed, using default:", err.message);
    });

    db = getFirestore(app, firestoreDatabaseId === "(default)" ? undefined : firestoreDatabaseId);
    console.log("[Firebase] Instance initialized:", firebaseConfig.projectId);
  }
} catch (error) {
  console.error("[Firebase] Fatal Initialization Error:", error.message);
  isConfigValid = false;
  initError = error.message;
}

export { app, auth, db, initError };

