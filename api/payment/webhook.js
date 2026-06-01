// api/payment/webhook.js
import snap from '../../src/lib/midtrans.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const notification = req.body;
    
    const statusResponse = await snap.transaction.notification(notification);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction ${orderId}: ${transactionStatus}`);

    // TODO: Update status user di Firebase (nanti kita tambah)
    if (transactionStatus === 'settlement' && fraudStatus === 'accept') {
      // Beri akses premium ke user
      console.log(`✅ Pembayaran sukses untuk order: ${orderId}`);
      // Tambahkan logic update user di sini nanti
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
