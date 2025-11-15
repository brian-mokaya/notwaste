export type PayHeroInitiateOptions = {
  amount: number;
  phone_number: string;
  provider?: string; // 'm-pesa' or 'sasapay'
  channel_id?: number;
  external_reference?: string;
  customer_name?: string;
  callback_url?: string;
  credential_id?: string;
  network_code?: string;
};

export type PayHeroInitiateResult = {
  success: boolean;
  status?: string;
  reference?: string;
  CheckoutRequestID?: string;
  error?: string;
};

export class PayHeroPayment {
  async initiatePayment(options: PayHeroInitiateOptions): Promise<PayHeroInitiateResult> {
    try {
      const resp = await fetch('/api/payhero/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        return { success: false, error: data?.error || data?.message || `Request failed with status ${resp.status}` };
      }

      return {
        success: true,
        status: data.status,
        reference: data.reference,
        CheckoutRequestID: data.CheckoutRequestID,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }
}
