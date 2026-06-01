// src/services/paymentService.js
import snap from '../lib/midtrans.js';

export async function createTransaction(orderId, grossAmount, customer) {
  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customer?.name || "Customer",
        email: customer?.email || "",
      },
      item_details: [{
        id: "langgam-premium",
        price: grossAmount,
        quantity: 1,
        name: "Langgam AI Voice - Premium Package",
      }]
    };

    const transaction = await snap.createTransaction(parameter);
    return {
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error("Midtrans Error:", error);
    return { success: false, error: error.message };
  }
}
