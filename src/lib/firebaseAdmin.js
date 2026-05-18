import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const clean = (val) => {
  if (val === null || val === undefined) return "";
  let res = String(val).trim();
  if (res === "null" || res === "undefined" || res === "") return "";
  // Strip quotes if any
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1).trim();
  }
  // Remove invisible characters
  return res.replace(/[\u200B-\u200D\ufeff\u00a0\u0000-\u001F\u007F-\u009F]/g, "");
};

// --- Environment and Config Setup ---
const projectId = clean(process.env.FIREBASE_PROJECT_ID);
const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// Export an initialization error message for diagnostic purposes.
export let initErrorMsg = null;

// Function to safely format private key
const formatPrivateKey = (key) => {
  if (!key || typeof key !== 'string') return null;
  
  let formatted = key.trim();
  if (formatted === '' || formatted === 'undefined' || formatted === 'null') return null;
  
  // 1. Resolve literal escaped newlines (e.g. "\\n" -> "\n")
  formatted = formatted.replace(/\\n/g, '\n');

  // 2. Remove surrounding quotes (common when copy-pasting)
  if ((formatted.startsWith('"') && formatted.endsWith('"')) || (formatted.startsWith("'") && formatted.endsWith("'"))) {
    formatted = formatted.substring(1, formatted.length - 1).trim();
  }

  // 3. Detect if it's a JSON string and extract private_key if so
  if (formatted.startsWith('{')) {
    try {
      // Try parsing normally first
      const parsed = JSON.parse(formatted);
      if (parsed.private_key) return formatPrivateKey(parsed.private_key);
    } catch (e) {
      // If parsing fails, it might have internal literal newlines that break JSON
      try {
        const cleanedJson = formatted.replace(/\n/g, '\\n');
        const parsed = JSON.parse(cleanedJson);
        if (parsed.private_key) return formatPrivateKey(parsed.private_key);
      } catch (e2) {
        console.warn("[Firebase Admin] Detected start of JSON but failed to parse even after cleaning.");
      }
    }
  }

  // 4. Force strictly clean PEM format
  const header = '-----BEGIN PRIVATE KEY-----';
  const footer = '-----END PRIVATE KEY-----';

  // If it already seems like a valid PEM with newlines, pass it through
  if (formatted.includes(header) && formatted.includes(footer) && formatted.includes('\n')) {
    return formatted;
  }

  // Otherwise, extract the base64 part and re-wrap it correctly
  const base64Part = formatted
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '') // Remove all whitespace
    .trim();

  if (!base64Part || base64Part.length < 500) {
    console.warn(`[Firebase Admin] Private key base64 content is suspiciously small (${base64Part ? base64Part.length : 0} chars).`);
  }

  // Wrap in proper PEM format: Header + 64-char lines + Footer
  const chunks = base64Part.match(/.{1,64}/g) || [base64Part];
  return `${header}\n${chunks.join('\n')}\n${footer}\n`;
};

const privateKey = formatPrivateKey(rawPrivateKey);

// Log detailed state for debugging
console.log("[Firebase Admin] Startup Diagnostic:");
console.log(` - Project ID: ${projectId || "(MISSING)"}`);
console.log(` - Client Email: ${clientEmail || "(MISSING)"}`);
console.log(` - Private Key length: ${privateKey ? privateKey.length : 0} chars`);

let app;

// Initialize Admin SDK
try {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
  } else {
    // Priority 1: Check if rawPrivateKey is a valid JSON service account
    let cert = null;
    if (rawPrivateKey && rawPrivateKey.trim().startsWith('{')) {
      try {
        const potential = JSON.parse(rawPrivateKey.trim());
        if (potential.private_key && potential.client_email) {
          cert = potential;
          console.log("[Firebase Admin] Initializing via full JSON service account.");
        }
      } catch (e) {
        // Cleaning literal newlines for JSON robustness
        try {
          const cleaned = rawPrivateKey.trim().replace(/\n/g, '\\n');
          const potential = JSON.parse(cleaned);
          if (potential.private_key && potential.client_email) {
            cert = potential;
            console.log("[Firebase Admin] Initializing via full JSON service account (after newline cleanup).");
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
    detail += " (Check your FIREBASE_PRIVATE_KEY format)";
  }
  initErrorMsg = `Initialization Error: ${detail}`;
  console.error(`[Firebase Admin] Critical Failure: ${error.message}`);
}


export const authAdmin = app ? admin.auth(app) : null;
export const dbAdmin = app ? admin.firestore(app) : null;
export default admin;
