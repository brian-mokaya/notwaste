export interface FoodListing {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'bakery' | 'restaurant' | 'cafe' | 'hotel' | 'other';
  quantity: number;
  unit: 'kg' | 'pieces' | 'portions' | 'liters';
  expiryTime: string;
  pickupTime: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  status: 'available' | 'sold' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  listingId: string;
  listing: FoodListing;
  quantity: number;
  totalPrice: number;
  commission: number;
  payoutAmount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  pickupScheduled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  listing: FoodListing;
  quantity: number;
}