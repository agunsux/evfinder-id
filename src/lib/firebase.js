import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDocFromCache, getDocFromServer } from "firebase/firestore";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const authDomainFallback = projectId ? `${projectId}.firebaseapp.com` : 'shinerva.id';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Force default firebaseapp.com domain to prevent Vercel SPA catch-all from breaking /__/auth/handler
  authDomain: projectId ? `${projectId}.firebaseapp.com` : authDomainFallback,
  projectId: projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys.filter(key => !firebaseConfig[key]);

let initError = null;
if (missingVars.length > 0) {
  initError = `Missing Firebase configuration keys: ${missingVars.join(", ")}. Please check your setup.`;
}

export let isConfigValid = (initError === null);
let app = null;
let auth = null;
let db = null;

try {
  if (isConfigValid) {
    const existingApps = getApps();
    app = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);
    
    auth = getAuth(app);
    
    // Explicitly set persistence to local
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.warn("[Firebase] Local persistence failed:", err.message);
    });

    const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
    const dbInstance = getFirestore(app, databaseId === "(default)" ? undefined : databaseId);
    db = dbInstance;
    console.log("[Firebase] Client initialized for project:", firebaseConfig.projectId, "DB:", databaseId);

    // Connection check as suggested by skill with better error handling
    const testConnection = async (attempt = 1) => {
      try {
        // Try accessing a document that shouldn't exist but triggers a server roundtrip
        await getDocFromServer(doc(dbInstance, '_system_', 'health-check'));
        console.log("[Firebase] Connection test: Success");
      } catch (error) {
        const msg = error.message || "";
        const code = error.code || "";
        
        if (code === 'permission-denied') {
          console.log("[Firebase] Connection test: Secured (Access Restricted)");
        } else if (code === 'not-found' || msg.includes('not-found') || msg.includes(' 5 ')) {
           console.log("[Firebase] Connection test: Document not found (Normal)");
        } else if (msg.includes('offline') || code === 'unavailable' || code === 'failed-precondition') {
          if (attempt < 3) {
            console.warn(`[Firebase] Connection attempt ${attempt} failed (unavailable). Retrying in 3s...`);
            setTimeout(() => testConnection(attempt + 1), 3000);
          } else {
            console.error("[Firebase] Client is offline or project unreachable. Please check if Firestore is enabled in Google Cloud Console.");
          }
        } else {
          console.warn("[Firebase] Connection test warning:", msg || error);
        }
      }
    };
    testConnection();
  }
} catch (error) {
  console.error("[Firebase] Fatal Initialization Error:", error.message);
  isConfigValid = false;
  initError = error.message || "Unknown error during Firebase initialization.";
}

export { app, auth, db, initError };

