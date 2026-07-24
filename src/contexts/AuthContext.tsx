import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile as firebaseUpdateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile on startup if token is available
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('memoryverse_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        localStorage.removeItem('memoryverse_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('memoryverse_token', token);
      
      // Load user profile from backend (will trigger seeding if missing)
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error: any) {
      localStorage.removeItem('memoryverse_token');
      setUser(null);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role = 'student') => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save display name to Firebase Auth user profile
      await firebaseUpdateProfile(userCredential.user, { displayName: name });
      
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('memoryverse_token', token);
      
      // Load/Seed profile on backend
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error: any) {
      localStorage.removeItem('memoryverse_token');
      setUser(null);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('memoryverse_token', token);
      
      // Load/Seed profile on backend
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error: any) {
      localStorage.removeItem('memoryverse_token');
      setUser(null);
      throw new Error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase signOut error:', error);
    }
    localStorage.removeItem('memoryverse_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/settings/profile', data);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
