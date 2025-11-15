// Helper script to manually update order status
// This would be replaced by proper webhook handling with Firebase Admin SDK

import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function updateOrderPaymentStatus(
  paymentReference: string,
  mpesaReceiptNumber: string,
  checkoutRequestID: string
) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('paymentReference', '==', paymentReference));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No order found with reference:', paymentReference);
      return false;
    }

    const orderDoc = querySnapshot.docs[0];
    await updateDoc(orderDoc.ref, {
      paymentStatus: 'completed',
      status: 'confirmed',
      mpesaReceiptNumber: mpesaReceiptNumber,
      mpesaCheckoutRequestID: checkoutRequestID,
      paymentCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('Order payment status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}
