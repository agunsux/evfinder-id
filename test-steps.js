import 'dotenv/config';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

console.log('--- STEP 4 & 5 ---');
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  console.log('Firebase initialized');
} catch (e) {
  console.log('Firebase init error:', e.message);
}

async function testFirebase() {
  try {
    const link = await admin.auth().generateSignInWithEmailLink('hello.shinerva@gmail.com', {
      url: 'https://shinerva.id',
      handleCodeInApp: true,
    });
    console.log('Generated Firebase URL:', link);
  } catch (e) {
    console.log('Firebase link generation failed:', e.message);
  }
}

testFirebase();
