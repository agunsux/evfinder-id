import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import configFromJson from "../../firebase-applet-config.json";

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

// Priority: Env vars, then JSON config
const firebaseConfig = {
  apiKey: "AIzaSy_REMOVED_BY_GIT_FILTER",
  authDomain: "practical-gecko-476621-q4.firebaseapp.com",
  projectId: "practical-gecko-476621-q4",
  storageBucket: "practical-gecko-476621-q4.firebasestorage.app",
  messagingSenderId: "240392759669",
  appId: "1:240392759669:web:f7a716bdd379422227cb3c",
};

const firestoreDatabaseId = "ai-studio-305f7bca-107e-4ee8-bbb4-57fef0edffb6";

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys.filter(key => !firebaseConfig[key]);

const correctProjectId = "practical-gecko-476621-q4";
const isCorrectProject = !firebaseConfig.projectId || firebaseConfig.projectId === correctProjectId;

let initError = null;
if (missingVars.length > 0) {
  initError = `Missing required environment variables: ${missingVars.join(", ")}.`;
} else if (!isCorrectProject) {
  initError = `Project ID mismatch: Expected ${correctProjectId}, got ${firebaseConfig.projectId}. Check VITE_FIREBASE_PROJECT_ID in settings.`;
}

export let isConfigValid = !initError;
let app = null;
let auth = null;
let db = null;

try {
  if (isConfigValid) {
    const existingApps = getApps();
    if (!existingApps.length) {
      const apiKey = firebaseConfig.apiKey || "";
      console.log("[Firebase] Initializing App:", { 
        projectId: firebaseConfig.projectId,
        apiKeySnippet: apiKey.slice(0, 10) + "..." + apiKey.slice(-5),
        apiKeyLen: apiKey.length,
        hasEnv: !!import.meta.env.VITE_FIREBASE_API_KEY,
        source: import.meta.env.VITE_FIREBASE_API_KEY ? "env" : "json"
      });
      app = initializeApp(firebaseConfig);
    } else {
      app = existingApps[0];
      console.log("[Firebase] Using existing app:", app.name, {
        projectId: app.options.projectId
      });
    }
    
    auth = getAuth(app);
    db = getFirestore(app, firestoreDatabaseId === "(default)" ? undefined : firestoreDatabaseId);
    console.log("[Firebase] Services initialized successfully.");
  }
} catch (error) {
  console.error("[Firebase] Fatal Initialization Error:", error.message, "Code:", error.code);
  isConfigValid = false;
  
  const rawKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
  const keyDisplay = rawKey.length > 10 ? `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}` : "missing/short";
  const diag = `Key: ${keyDisplay} (Len: ${rawKey.length}). Project: ${firebaseConfig.projectId}.`;

  if (error.code === "auth/invalid-api-key" || error.message.includes("invalid-api-key")) {
    initError = `API Key tidak valid (auth/invalid-api-key). ${diag} Pastikan VITE_FIREBASE_API_KEY benar untuk project ${firebaseConfig.projectId}.`;
  } else {
    initError = `Firebase Error: ${error.message} (${error.code || 'n/a'}). ${diag}`;
  }
}

export { app, auth, db, initError };

