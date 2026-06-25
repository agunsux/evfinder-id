// api/payment/create.js
import { createTransaction } from '../../../src/services/paymentService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderId = "TEST-" + Date.now();
    const grossAmount = 10000;

    const result = await createTransaction(orderId, grossAmount, {
      name: "Test User",
      email: "test@shinerva.id"
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Create Payment Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}
