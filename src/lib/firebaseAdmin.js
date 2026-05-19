import admin from 'firebase-admin';
import dotenv from 'dotenv';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

dotenv.config();

const clean = (val) => {
  if (val === null || val === undefined) return "";
  let res = String(val).trim();
  if (res === "null" || res === "undefined" || res === "") return "";
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1).trim();
  }
  return res.replace(/[\u200B-\u200D\ufeff\u00a0\u0000-\u001F\u007F-\u009F]/g, "");
};

const projectId = clean(process.env.FIREBASE_PROJECT_ID) || firebaseConfig.projectId;
const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

export let initErrorMsg = null;

const formatPrivateKey = (key) => {
  if (!key || typeof key !== 'string') return null;
  let formatted = key.trim();
  
  // Resolve escaped newlines
  formatted = formatted.replace(/\\n/g, '\n');
  
  // Handle JSON
  if (formatted.startsWith('{')) {
    try {
      const parsed = JSON.parse(formatted);
      if (parsed.private_key) return formatPrivateKey(parsed.private_key);
    } catch (e) {
      try {
        const cleaned = formatted.replace(/\n/g, '\\n');
        const parsed = JSON.parse(cleaned);
        if (parsed.private_key) return formatPrivateKey(parsed.private_key);
      } catch (e2) {}
    }
  }

  // If valid multi-line PEM, return as is
  if (formatted.includes('-----BEGIN PRIVATE KEY-----') && formatted.includes('\n')) {
    return formatted;
  }

  // Normalize into multi-line PEM
  const base64 = formatted
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (!base64 || base64.length < 100) return formatted;

  const chunks = base64.match(/.{1,64}/g) || [base64];
  return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
};

const privateKey = formatPrivateKey(rawPrivateKey);

console.log("[Firebase Admin] Startup Diagnostic:");
console.log(` - Project ID: ${projectId || "(MISSING)"}`);
console.log(` - Database ID: ${firebaseConfig.firestoreDatabaseId || "(default)"}`);
console.log(` - Client Email: ${clientEmail || "(MISSING)"}`);
if (privateKey) {
  const preview = privateKey.substring(0, 31).replace(/\n/g, "\\n");
  console.log(` - Private Key length: ${privateKey.length} chars (Start: ${preview}...)`);
} else {
  console.log(` - Private Key: MISSING OR INVALID`);
}

let app;

try {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
  } else {
    let cert = null;
    if (rawPrivateKey && rawPrivateKey.trim().startsWith('{')) {
      try {
        const potential = JSON.parse(rawPrivateKey.trim());
        if (potential.private_key && potential.client_email) {
          cert = potential;
        }
      } catch (e) {
        try {
          const cleaned = rawPrivateKey.trim().replace(/\n/g, '\\n');
          const potential = JSON.parse(cleaned);
          if (potential.private_key && potential.client_email) {
            cert = potential;
          }
        } catch (e2) {}
      }
    }

    if (cert) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: cert.project_id || projectId,
          clientEmail: cert.client_email,
          privateKey: formatPrivateKey(cert.private_key)
        }),
        projectId: cert.project_id || projectId
      });
    } else if (projectId && clientEmail && privateKey) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId
      });
    } else {
      const missing = [];
      if (!projectId) missing.push("FIREBASE_PROJECT_ID");
      if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
      initErrorMsg = `Missing Credentials: ${missing.join(", ")}`;
      console.error(`[Firebase Admin] ${initErrorMsg}`);
    }
  }
} catch (error) {
  let detail = error.message;
  if (detail.includes("ASN.1")) {
    detail += " (Check your FIREBASE_PRIVATE_KEY format in Settings)";
  }
  initErrorMsg = `Initialization Error: ${detail}`;
  console.error(`[Firebase Admin] Critical Failure: ${error.message}`);
}

export const authAdmin = app ? admin.auth(app) : null;

// Return a Firestore instance, with optional databaseId
export const getFirestoreDb = (databaseId) => {
  if (!app) return null;
  try {
    const dbId = (!databaseId || databaseId === "(default)" || databaseId === "") ? undefined : databaseId;
    return admin.firestore(app, dbId);
  } catch (err) {
    console.warn("[Firebase Admin] Firestore instance warning (might be offline):", err.message);
    // If it fails because of databaseId, try (default)
    if (databaseId && databaseId !== "(default)") {
      console.log("[Firebase Admin] Retrying with (default) database...");
      try {
        return admin.firestore(app);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
};

export let dbAdmin = getFirestoreDb(firebaseConfig.firestoreDatabaseId || "(default)");

export const setDbAdmin = (newDb) => {
  dbAdmin = newDb;
};

export default admin;
