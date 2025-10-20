import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthResponseDto } from '@/models/Auth';
import storageService from '@/utils/storage';
import { ROLES } from '@/utils/constants';

interface AuthContextData {
  user: AuthResponseDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCourtAuthority: boolean; // ✅ ADD
  isStationAuthority: boolean; // ✅ ADD
  isJudge: boolean; // ✅ ADD
  login: (token: string, userData: AuthResponseDto) => void;
  logout: () => void;
  refreshUser: () => void;
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

  const loadUser = () => {
    try {
      const token = storageService.getToken();
      const userData = storageService.getUserData();

      if (token && userData) {
        // Check if token is expired
        const expiresAt = new Date(userData.expiresAt);
        const now = new Date();

        if (expiresAt > now) {
          setUser(userData);
        } else {
          // Token expired, clear storage
          storageService.clearAll();
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      storageService.clearAll();
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: AuthResponseDto) => {
    try {
      storageService.saveToken(token);
      storageService.saveUserData(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      storageService.clearAll();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUser = () => {
    try {
      const userData = storageService.getUserData();
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
        isAdmin: user?.role === ROLES.ADMIN,
        isCourtAuthority: user?.role === ROLES.COURT_AUTHORITY, // ✅ ADD
        isStationAuthority: user?.role === ROLES.STATION_AUTHORITY, // ✅ ADD
        isJudge: user?.role === ROLES.JUDGE, // ✅ ADD
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