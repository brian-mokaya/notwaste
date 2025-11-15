export type IntaSendInitiateOptions = {
  amount: number;
  currency?: string;
  email: string;
  phone?: string;
  items?: unknown[];
  userId?: string;
  redirect_url?: string;
  webhook_url?: string;
};

export type IntaSendInitiateResult = {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
};

export class IntaSendPayment {
  async initiatePayment(options: IntaSendInitiateOptions): Promise<IntaSendInitiateResult> {
    try {
      const resp = await fetch('/api/intasend/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        return { success: false, error: data?.error || `Request failed with status ${resp.status}` };
      }

      return { success: true, payment_url: data.payment_url, transaction_id: data.transaction_id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }
}
