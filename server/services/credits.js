// server/services/credits.js
import admin from '../../src/lib/firebaseAdmin.js';
// import { generateId } from '../../server.js'; // removed unused import
import crypto from 'crypto';

/**
 * Deduct characters (credits) atomically using Firestore transaction.
 * Includes idempotency check via generationId to avoid double processing.
 */
export async function deductCredits({ uid, charCost, generationId, ip, model, promptTokens, completionTokens }) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);
  const generationRef = userRef.collection('generation_events').doc(generationId);
  const result = await db.runTransaction(async (t) => {
    const userSnap = await t.get(userRef);
    if (!userSnap.exists) throw new Error('User not found');
    const userData = userSnap.data();
    // Idempotency: check if this generationId already logged
    const genSnap = await t.get(generationRef);
    if (genSnap.exists) {
      // Already processed, skip deduction
      return { alreadyProcessed: true };
    }
    // Ensure enough credits
    const available = (userData.monthly_chars || 0) + (userData.signup_bonus_chars || 0) + (userData.earned_chars || 0) - (userData.used_chars || 0);
    if (available < charCost) {
      throw new Error('Insufficient credits');
    }
    // Update user counters
    const newUsed = (userData.used_chars || 0) + charCost;
    const newGenCount = (userData.generation_count || 0) + 1;
    const updates = {
      used_chars: newUsed,
      generation_count: newGenCount,
      last_generation_at: admin.firestore.FieldValue.serverTimestamp()
    };
    t.update(userRef, updates);
    // Log generation event for audit
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;
    const eventData = {
      userId: uid,
      generationId,
      charactersUsed: charCost,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipHash,
      model,
      promptTokens,
      completionTokens,
      success: true
    };
    t.set(generationRef, eventData);
    return { alreadyProcessed: false };
  });
  return result;
}
