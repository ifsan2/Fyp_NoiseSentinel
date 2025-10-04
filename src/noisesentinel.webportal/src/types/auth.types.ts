export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterAuthorityDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: 'Court Authority' | 'Station Authority';
}

export interface CreateJudgeDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  cnic: string;
  contactNo: string;
  rank: string;
  courtId: number;
  serviceStatus: boolean;
}

export interface CreatePoliceOfficerDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
  stationId: number;
  postingDate?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface UserCreatedResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  message: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data?: T;
  errors?: string[];
}