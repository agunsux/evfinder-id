import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// We use environment variables for Firebase configuration.
// These must be prefixed with VITE_ to be exposed to the client.
// Fallback for development/preview if environment variables are not set in AI Studio Settings
const fallbackConfig = {
  apiKey: "AIzaSy_REMOVED_BY_GIT_FILTER",
  authDomain: "practical-gecko-476621-q4.firebaseapp.com",
  projectId: "practical-gecko-476621-q4",
  storageBucket: "practical-gecko-476621-q4.firebasestorage.app",
  messagingSenderId: "240392759669",
  appId: "1:240392759669:web:f7a716bdd379422227cb3c",
  firestoreDatabaseId: "ai-studio-shinerva-305f7bca-107e-4ee8-bbb4-57fef0edffb6"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || fallbackConfig.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
