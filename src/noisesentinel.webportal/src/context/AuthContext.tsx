import { createContext } from 'react';
import { User } from '../types/user.types';
import { AuthResponseDto } from '../types/auth.types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (authResponse: AuthResponseDto) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isCourtAuthority: boolean;
  isStationAuthority: boolean;
  isJudge: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);