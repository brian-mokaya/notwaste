import { CartItem } from '@/contexts/CartContext';

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  items: CartItem[];
  userId: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

export class IntaSendPayment {
  constructor() {}

  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, all payments are initiated via serverless API

      const response = await fetch(`/api/intasend/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          email: paymentRequest.email,
          phone: paymentRequest.phone,
          items: paymentRequest.items.map(item => ({
            listing_id: item.listingId,
            quantity: item.quantity,
            price: item.price,
          })),
          userId: paymentRequest.userId,
          redirect_url: `${window.location.origin}/payment/success`,
          webhook_url: `${window.location.origin}/api/payment/webhook`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        payment_url: data.url,
        transaction_id: data.id
      };
    } catch (error) {
      console.error('IntaSend payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      // Always verify via serverless API in production

      const response = await fetch(`/api/intasend/verify?transactionId=${encodeURIComponent(transactionId)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        status: data.state
      };
    } catch (error) {
      console.error('IntaSend payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}