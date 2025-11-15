// Vercel Serverless Function: PayHero Webhook Receiver
// Receives payment callbacks from PayHero

import { updateOrderByReference } from '../lib/firebase-admin';

export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  try {
    const text = await req.text();
    console.log('PayHero webhook received:', text);

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    // PayHero callback format:
    // {
    //   "forward_url": "",
    //   "response": {
    //     "Amount": 10,
    //     "CheckoutRequestID": "ws_CO_14012024103543427709099876",
    //     "ExternalReference": "INV-009",
    //     "MerchantRequestID": "3202-70921557-1",
    //     "MpesaReceiptNumber": "SAE3YULR0Y",
    //     "Phone": "+254709099876",
    //     "ResultCode": 0,
    //     "ResultDesc": "The service request is processed successfully.",
    //     "Status": "Success"
    //   },
    //   "status": true
    // }

    const { response, status } = payload;
    
    if (status && response) {
      const {
        Amount,
        CheckoutRequestID,
        ExternalReference,
        MpesaReceiptNumber,
        Phone,
        ResultCode,
        ResultDesc,
        Status
      } = response;

      console.log('Payment callback:', {
        amount: Amount,
        reference: ExternalReference,
        mpesaReceipt: MpesaReceiptNumber,
        phone: Phone,
        resultCode: ResultCode,
        status: Status,
      });

      // Update Firestore database with payment status
      // When ResultCode === 0, payment is COMPLETED successfully
      
      if (ResultCode === 0 && Status === 'Success') {
        // ✅ PAYMENT COMPLETED - Update order to "completed" status
        console.log(`✅ Payment COMPLETED for order ${ExternalReference}: ${MpesaReceiptNumber}`);
        
        // Update order in Firestore
        const updated = await updateOrderByReference(ExternalReference, {
          paymentStatus: 'completed',
          status: 'confirmed',
          mpesaReceiptNumber: MpesaReceiptNumber,
          mpesaCheckoutRequestID: CheckoutRequestID,
          paymentCompletedAt: new Date().toISOString(),
        });
        
        if (updated) {
          console.log('✅ Order status updated to COMPLETED in Firestore');
        } else {
          console.warn('⚠️ Failed to update order in Firestore. Order will remain pending.');
        }
        
      } else {
        // ❌ Payment failed
        console.log(`❌ Payment FAILED for order ${ExternalReference}: ${ResultDesc}`);
        
        // Update order with failed status
        const updated = await updateOrderByReference(ExternalReference, {
          paymentStatus: 'failed',
          status: 'cancelled',
          paymentError: ResultDesc,
        });
        
        if (updated) {
          console.log('✅ Order status updated to FAILED in Firestore');
        } else {
          console.warn('⚠️ Failed to update order failure in Firestore');
        }
      }
    }

    return json({ received: true }, 200);
  } catch (error: any) {
    console.error('Webhook error:', error);
    return json({ error: error?.message || 'Internal Server Error' }, 500);
  }
}


