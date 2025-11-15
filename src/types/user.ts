export type UserRole = 'business' | 'buyer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  businessName?: string; // For business users
  organizationType?: 'individual' | 'ngo' | 'hostel'; // For buyers
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}