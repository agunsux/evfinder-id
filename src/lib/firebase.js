import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDocFromCache, getDocFromServer } from "firebase/firestore";
import firebaseConfig from '../../firebase-applet-config.json';

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredKeys.filter(key => !firebaseConfig[key]);

let initError = null;
if (missingVars.length > 0) {
  initError = `Missing Firebase configuration keys: ${missingVars.join(", ")}. Please check your setup.`;
}

export let isConfigValid = !initError;
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

    db = getFirestore(app);
    console.log("[Firebase] Client initialized for project:", firebaseConfig.projectId);

    // Connection check as suggested by skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_system_', 'health'));
      } catch (error) {
        if (error.code === 'permission-denied') {
          // Expected since the doc doesn't exist and rules are tight
          console.log("[Firebase] Connection test: Secured (Permission Denied as expected)");
        } else if (error.message.includes('offline') || error.code === 'unavailable') {
          console.error("[Firebase] Client is offline or project unreachable.");
        }
      }
    };
    testConnection();
  }
} catch (error) {
  console.error("[Firebase] Fatal Initialization Error:", error.message);
  isConfigValid = false;
  initError = error.message;
}

export { app, auth, db, initError };

