const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// 1. generateReferralCode
exports.generateReferralCode = functions.auth.user().onCreate(async (user) => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    emailVerified: false,
    referralCode: code,
    creditBalance: 0,
    totalCreditsPurchased: 0,
    totalCreditsEarnedReferral: 0,
    totalCreditsEarnedSocial: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    firstGenerationDone: false
  });
});

// Implement other functions here...
