export interface CreatePaymentRequest {
  orderId: number;
  method: 'CASH' | 'TRANSFER' | 'E_WALLET';
  transactionRef?: string;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  transactionRef: string | null;
  paidAt: string | null;
  createdAt: string;
}
