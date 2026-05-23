import { authAdmin } from './src/lib/firebaseAdmin.js';
import admin from 'firebase-admin';

async function test() {
  try {
    const app = admin.app();
    const tokenObj = await app.options.credential.getAccessToken();
    console.log("Token:", tokenObj.access_token ? "SUCCESS" : "FAIL");
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
