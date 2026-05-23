import { authAdmin } from './src/lib/firebaseAdmin.js';

async function test() {
  console.log("Starting verifyIdToken...");
  try {
    await authAdmin.verifyIdToken("fake-token-123");
    console.log("Success");
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
