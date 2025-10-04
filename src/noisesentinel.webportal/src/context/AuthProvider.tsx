import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { User } from '../types/user.types';
import { AuthResponseDto } from '../types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (authResponse: AuthResponseDto) => {
    const userData: User = {
      userId: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
    };

    setUser(userData);
    setToken(authResponse.token);
    localStorage.setItem('authToken', authResponse.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;
  const isCourtAuthority = user?.role === 'Court Authority';
  const isStationAuthority = user?.role === 'Station Authority';
  const isJudge = user?.role === 'Judge';

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isCourtAuthority,
    isStationAuthority,
    isJudge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};