const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// 1. generateReferralCode
exports.generateReferralCode = functions.auth.user().onCreate(async (user) => {
  let code = Math.random().toString(36).substring(2, 10).toUpperCase();
  // Ensure uniqueness
  let unique = false;
  while (!unique) {
    const snapshot = await db.collection('users').where('referralCode', '==', code).get();
    if (snapshot.empty) {
      unique = true;
    } else {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
    }
  }
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

// 2. trackReferralSignup
exports.trackReferralSignup = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Harap login.');
  const { referralCode } = data;
  if (!referralCode) throw new functions.https.HttpsError('invalid-argument', 'Kode referensi diperlukan.');

  const referrerSnapshot = await db.collection('users').where('referralCode', '==', referralCode).get();
  if (referrerSnapshot.empty) throw new functions.https.HttpsError('not-found', 'Kode referensi tidak valid.');

  const referrerDoc = referrerSnapshot.docs[0];
  if (referrerDoc.id === context.auth.uid) throw new functions.https.HttpsError('invalid-argument', 'Tidak bisa referensi diri sendiri.');

  await db.collection('users').doc(context.auth.uid).update({
    referredBy: referrerDoc.id
  });

  return { success: true };
});

// 3. onFirstGeneration
exports.onFirstGeneration = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Harap login.');
  
  const userRef = db.collection('users').doc(context.auth.uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User tidak ditemukan.');
  
  const userData = userDoc.data();
  if (userData.firstGenerationDone) return { success: true, message: 'Bonus sudah diterima sebelumnya.' };
  
  // Anti-abuse: Check email verification
  if (!userData.emailVerified) throw new functions.https.HttpsError('failed-precondition', 'Harap verifikasi email terlebih dahulu.');

  await userRef.update({ firstGenerationDone: true });
  
  if (userData.referredBy) {
    const referrerRef = db.collection('users').doc(userData.referredBy);
    const month = new Date().toISOString().substring(0, 7);
    
    // Check monthly limit
    const referralSnapshot = await db.collection('referrals')
      .where('referrerUid', '==', userData.referredBy)
      .where('month', '==', month)
      .where('status', '==', 'completed')
      .get();
    
    if (referralSnapshot.size < 20) {
      // Award bonuses
      const batch = db.batch();
      
      const newReferralRef = db.collection('referrals').doc();
      batch.set(newReferralRef, {
        referrerUid: userData.referredBy,
        refereeUid: context.auth.uid,
        status: 'completed',
        month: month,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        bonusAwarded: 10000
      });
      
      batch.update(referrerRef, { 
        creditBalance: admin.firestore.FieldValue.increment(10000),
        totalCreditsEarnedReferral: admin.firestore.FieldValue.increment(10000)
      });
      batch.update(userRef, { 
        creditBalance: admin.firestore.FieldValue.increment(10000),
        totalCreditsEarnedReferral: admin.firestore.FieldValue.increment(10000)
      });
      
      // Log transactions
      const txRef = db.collection('creditTransactions').doc();
      batch.set(txRef, {
        uid: userData.referredBy,
        type: 'referral_bonus',
        amount: 10000,
        balanceAfter: userData.creditBalance + 10000, // This is simplified
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        description: 'Referral bonus'
      });
      
      await batch.commit();
      return { success: true, message: 'Bonus referensi berhasil diberikan.' };
    } else {
        // Log limit reached
        await db.collection('referrals').add({
            referrerUid: userData.referredBy,
            refereeUid: context.auth.uid,
            status: 'limit_reached',
            month: month,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: 'Batas bulanan tercapai.' };
    }
  }
  
  return { success: true };
});

// 4. getReferralStats
exports.getReferralStats = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Harap login.');
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    
    const month = new Date().toISOString().substring(0, 7);
    const referralSnapshot = await db.collection('referrals')
      .where('referrerUid', '==', context.auth.uid)
      .where('month', '==', month)
      .get();
      
    return {
        referralCode: userData.referralCode,
        thisMonthCount: referralSnapshot.size,
        totalBonusEarned: userData.totalCreditsEarnedReferral
    };
});
