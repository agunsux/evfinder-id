import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDocFromCache, getDocFromServer } from "firebase/firestore";
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

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

    const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
    const dbInstance = getFirestore(app, databaseId === "(default)" ? undefined : databaseId);
    db = dbInstance;
    console.log("[Firebase] Client initialized for project:", firebaseConfig.projectId, "DB:", databaseId);

    // Connection check as suggested by skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(dbInstance, '_system_', 'health'));
        console.log("[Firebase] Connection test: Success");
      } catch (error) {
        if (error.code === 'permission-denied') {
          console.log("[Firebase] Connection test: Secured (Permission Denied as expected)");
        } else if (error.code === 'not-found' || error.message.includes('not-found') || error.message.includes('5')) {
           if (databaseId !== "(default)") {
             console.warn("[Firebase] Named database not found, trying default...");
             db = getFirestore(app);
           }
        } else if (error.message.includes('offline') || error.code === 'unavailable') {
          console.error("[Firebase] Client is offline or project unreachable.");
        } else {
          console.warn("[Firebase] Connection test warning:", error.message);
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

