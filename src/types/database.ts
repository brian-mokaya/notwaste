export interface PaymentChannel {
  id: string;
  user_id: string;
  name: string;
  channel_id: number;
  provider: 'm-pesa' | 'sasapay';
  is_wallet: boolean;
  network_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  channel_id: string | null;
  amount: number;
  phone_number: string;
  customer_name: string | null;
  external_reference: string | null;
  payhero_reference: string | null;
  checkout_request_id: string | null;
  mpesa_receipt_number: string | null;
  status: 'QUEUED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  result_code: number | null;
  result_description: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
