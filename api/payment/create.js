// api/payment/create.js
import { createTransaction } from '../../src/services/paymentService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderId, grossAmount, customer } = req.body;

    const result = await createTransaction(orderId, grossAmount, customer);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create Payment Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
