export interface MidtransRequest {
  price: number;
  planId: string;
  planName: string;
}

export interface MidtransItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface MidtransPayload {
  transaction_details: MidtransTransactionDetails;
  item_details: MidtransItemDetail[];
}

export interface MidtransResponse {
  token: string;
  redirect_url?: string;
}
