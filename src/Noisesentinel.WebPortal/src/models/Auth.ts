// Login DTO
export interface LoginDto {
  username: string;
  password: string;
}

// Auth Response DTO
export interface AuthResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
}

// Register Admin DTO
export interface RegisterAdminDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Create Admin DTO
export interface CreateAdminDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

// Create Court Authority DTO
export interface CreateCourtAuthorityDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

// Create Station Authority DTO
export interface CreateStationAuthorityDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

// Change Password DTO
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User Created Response DTO
export interface UserCreatedResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  message: string;
}