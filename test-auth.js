import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

async function testAuth() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log("Token:", token.token ? "SUCCESS" : "FAIL");
    
    // Now let's try calling TTS
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.token}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        input: { text: "Testing TTS" },
        voice: { languageCode: "id-ID", name: "id-ID-Standard-A" },
        audioConfig: { audioEncoding: "MP3" }
      })
    });
    const data = await response.json();
    if (data.audioContent) {
      console.log("TTS SUCCESS!");
    } else {
      console.log("TTS FAIL:", data);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
testAuth();
