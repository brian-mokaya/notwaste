import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { User, AuthState } from '@/types/user';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('wastenot_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found in database.');
      }
      const userData = userDoc.data();
      setState({
        user: {
          id: user.uid,
          email: user.email!,
          name: userData.name || '',
          role: userData.role || 'buyer',
          phone: userData.phone,
          address: userData.address,
          businessName: userData.businessName,
          organizationType: userData.organizationType,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        isLoading: false,
        isAuthenticated: true,
      });
      localStorage.setItem('wastenot_user', JSON.stringify({
        id: user.uid,
        email: user.email!,
        name: userData.name || '',
        role: userData.role || 'buyer',
        phone: userData.phone,
        address: userData.address,
        businessName: userData.businessName,
        organizationType: userData.organizationType,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email!, userData.password!);
      const user = userCredential.user;
      // Store user profile in Firestore with UID as doc ID
      const newUser: User = {
        id: user.uid,
        email: user.email!,
        name: userData.name!,
        role: userData.role!,
        phone: userData.phone,
        address: userData.address,
        businessName: userData.businessName,
        organizationType: userData.organizationType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), newUser);
      localStorage.setItem('wastenot_user', JSON.stringify(newUser));
      setState({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('wastenot_user');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};