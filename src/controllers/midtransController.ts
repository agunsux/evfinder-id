
import type { Request, Response } from 'express';
import midtransClient from 'midtrans-client';
import type { MidtransRequest, MidtransPayload, MidtransResponse } from '../types/midtrans.js';

// Initialize Snap client in sandbox mode (isProduction: false)
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
});

/**
 * POST /api/checkout/midtrans
 * Expects JSON body: { price: number, planId: string, planName: string }
 * Returns Midtrans Snap token.
 */
export async function createMidtransToken(req: Request, res: Response): Promise<Response> {
  try {
    // Validate env
    if (!process.env.MIDTRANS_SERVER_KEY) {
      return res.status(500).json({ error: 'Midtrans server key not configured' });
    }

    const { price, planId, planName } = req.body as MidtransRequest;

    if (typeof price !== 'number' || !planId || !planName) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    const payload: MidtransPayload = {
      transaction_details: {
        order_id: `SHINERVA-VOUCHER-${Date.now()}`,
        gross_amount: price,
      },
      item_details: [
        {
          id: planId,
          price,
          quantity: 1,
          name: planName,
        },
      ],
    };

    // Create transaction via Midtrans Snap client
    const transaction = await snap.createTransaction(payload as any);
    const response: MidtransResponse = { token: transaction.token };
    return res.json(response);
  } catch (err: any) {
    console.error('[Midtrans] Token creation failed:', err);
    return res.status(500).json({ error: err.message ?? 'Midtrans error' });
  }
}
