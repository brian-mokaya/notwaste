// Firebase Admin SDK configuration for server-side operations
// This is used in Vercel Edge Functions to update Firestore securely

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin only once
let adminDb: any = null;

try {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      console.warn('Firebase Admin credentials not configured. Webhook updates will not work in production.');
      console.warn('Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to environment variables.');
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      adminDb = getFirestore();
      console.log('✅ Firebase Admin initialized successfully');
    }
  } else {
    adminDb = getFirestore();
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error);
}

/**
 * Update order payment status in Firestore
 * @param paymentReference - Order payment reference (e.g., ORDER-1234567890)
 * @param data - Data to update
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function updateOrderByReference(
  paymentReference: string,
  data: Record<string, any>
): Promise<boolean> {
  if (!adminDb) {
    console.error('Firebase Admin not initialized. Cannot update order.');
    return false;
  }

  try {
    console.log(`Updating order with reference: ${paymentReference}`);
    
    const ordersRef = adminDb.collection('orders');
    const snapshot = await ordersRef
      .where('paymentReference', '==', paymentReference)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error(`No order found with reference: ${paymentReference}`);
      return false;
    }

    const orderDoc = snapshot.docs[0];
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await orderDoc.ref.update(updateData);

    console.log(`Order ${paymentReference} updated successfully with:`, updateData);
    return true;
  } catch (error) {
    console.error(`Error updating order ${paymentReference}:`, error);
    return false;
  }
}

/**
 * Export adminDb for direct use if needed
 */
export { adminDb };
