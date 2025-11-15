// Payment status checking utilities
// These can be called from the frontend to check payment status with PayHero

export interface PayHeroQueryResponse {
  Amount: number;
  CheckoutRequestID: string;
  ExternalReference: string;
  MerchantRequestID: string;
  MpesaReceiptNumber?: string;
  Phone: string;
  ResultCode: number;
  ResultDesc: string;
  Status: 'Success' | 'Failed' | 'Pending';
}

/**
 * Query PayHero API for payment status
 * This can be used to poll for payment completion
 */
export async function queryPaymentStatus(
  checkoutRequestID: string
): Promise<PayHeroQueryResponse | null> {
  try {
    const basicAuth = import.meta.env.VITE_PAYHERO_BASIC_AUTH;
    if (!basicAuth) {
      console.error('PayHero credentials not configured');
      return null;
    }

    const response = await fetch(
      `https://backend.payhero.co.ke/api/v2/payments/query/${checkoutRequestID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to query payment status:', response.status);
      return null;
    }

    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('Error querying payment status:', error);
    return null;
  }
}

/**
 * Poll for payment completion with exponential backoff
 * @param checkoutRequestID - The CheckoutRequestID from payment initiation
 * @param maxAttempts - Maximum number of polling attempts (default: 20)
 * @param initialDelay - Initial delay in milliseconds (default: 3000)
 */
export async function pollPaymentStatus(
  checkoutRequestID: string,
  maxAttempts: number = 20,
  initialDelay: number = 3000
): Promise<PayHeroQueryResponse | null> {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    attempts++;
    
    // Wait before checking
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const status = await queryPaymentStatus(checkoutRequestID);
    
    if (status && status.Status !== 'Pending') {
      return status;
    }
    
    // Exponential backoff (max 30 seconds)
    delay = Math.min(delay * 1.5, 30000);
  }

  return null;
}
