import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthResponseDto } from '../models/Auth';
import storageService from '../services/storage.service';
import authApi from '../api/authApi';

interface AuthContextData {
  user: AuthResponseDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: AuthResponseDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storageService.getToken();
      const userData = await storageService.getUserData();

      if (token && userData) {
        // Check if token is expired
        const expiresAt = new Date(userData.expiresAt);
        const now = new Date();

        if (expiresAt > now) {
          setUser(userData);
        } else {
          // Token expired, clear storage
          await storageService.clearAll();
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await storageService.clearAll();
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: AuthResponseDto) => {
    try {
      await storageService.saveToken(token);
      await storageService.saveUserData(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storageService.clearAll();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await storageService.getUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};