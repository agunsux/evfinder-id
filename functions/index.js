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
      const txRef1 = db.collection('creditTransactions').doc();
      batch.set(txRef1, {
        uid: userData.referredBy,
        type: 'referral_bonus',
        amount: 10000,
        balanceAfter: userData.creditBalance + 10000, 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        description: 'Referral bonus'
      });
      const txRef2 = db.collection('creditTransactions').doc();
      batch.set(txRef2, {
        uid: context.auth.uid,
        type: 'referral_bonus',
        amount: 10000,
        balanceAfter: userData.creditBalance + 10000, 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        description: 'Referral bonus (referee)'
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

// 4. submitSocialClaim
exports.submitSocialClaim = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Harap login.');
    const { postUrl, platform } = data;
    
    const userRef = db.collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();
    if (!userDoc.data().firstGenerationDone) throw new functions.https.HttpsError('failed-precondition', 'Harap lakukan generasi suara pertama.');

    const month = new Date().toISOString().substring(0, 7);
    const existingClaims = await db.collection('socialClaims')
        .where('uid', '==', context.auth.uid)
        .where('month', '==', month)
        .get();
    
    if (existingClaims.size >= 4) throw new functions.https.HttpsError('failed-precondition', 'Limit klaim bulanan tercapai.');

    const urlHash = require('crypto').createHash('sha256').update(postUrl).digest('hex');
    const duplicateClaim = await db.collection('socialClaims').where('urlHash', '==', urlHash).get();
    if (!duplicateClaim.empty) throw new functions.https.HttpsError('already-exists', 'Post ini sudah diklaim.');

    await db.collection('socialClaims').add({
        uid: context.auth.uid,
        platform,
        postUrl,
        urlHash,
        status: 'pending_review',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        month: month,
        bonusAwarded: 5000
    });
    
    return { success: true };
});

// 5. reviewSocialClaim
exports.reviewSocialClaim = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) throw new functions.https.HttpsError('permission-denied', 'Hanya admin.');
    const { claimId, action, rejectionReason } = data;
    
    const claimRef = db.collection('socialClaims').doc(claimId);
    const claimDoc = await claimRef.get();
    if (action === 'approve') {
        const batch = db.batch();
        batch.update(claimRef, { status: 'approved', reviewedAt: admin.firestore.FieldValue.serverTimestamp(), reviewedBy: context.auth.uid });
        batch.update(db.collection('users').doc(claimDoc.data().uid), {
            creditBalance: admin.firestore.FieldValue.increment(5000),
            totalCreditsEarnedSocial: admin.firestore.FieldValue.increment(5000)
        });
        await batch.commit();
    } else {
        await claimRef.update({ status: 'rejected', reviewedAt: admin.firestore.FieldValue.serverTimestamp(), reviewedBy: context.auth.uid, rejectionReason });
    }
    return { success: true };
});

// 6. getReferralStats
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

// 7. getSocialClaimHistory
exports.getSocialClaimHistory = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Harap login.');
    const month = new Date().toISOString().substring(0, 7);
    const claims = await db.collection('socialClaims')
        .where('uid', '==', context.auth.uid)
        .where('month', '==', month)
        .get();
        
    return {
        thisMonthClaims: claims.size,
        history: claims.docs.map(doc => doc.data())
    };
});
