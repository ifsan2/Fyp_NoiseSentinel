export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
  requiresEmailVerification?: boolean;
  mustChangePassword?: boolean;
  isFirstLogin?: boolean;
}

export interface UserDetailsDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  roleId?: number;
  roleName?: string;
  // For Judge
  judgeId?: number;
  cnic?: string;
  contactNo?: string;
  rank?: string;
  courtId?: number;
  courtName?: string;
  courtLocation?: string;
  courtType?: string;
  // For Police Officer
  officerId?: number;
  badgeNumber?: string;
  isInvestigationOfficer?: boolean;
  stationId?: number;
  stationName?: string;
  stationLocation?: string;
  stationCode?: string;
  postingDate?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  isForcedChange?: boolean;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ResendOtpDto {
  email: string;
}
