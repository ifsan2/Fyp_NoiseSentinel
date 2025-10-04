import axiosInstance from './axiosConfig';
import {
  LoginDto,
  RegisterAuthorityDto,
  CreateJudgeDto,
  CreatePoliceOfficerDto,
  ChangePasswordDto,
  AuthResponseDto,
  UserCreatedResponseDto,
  ApiResponse,
} from '../types/auth.types';

export const authApi = {
  // Login
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await axiosInstance.post('/Auth/login', data);
    return response.data;
  },

  // Register Court Authority
  registerCourtAuthority: async (data: RegisterAuthorityDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await axiosInstance.post('/Auth/register/court-authority', data);
    return response.data;
  },

  // Register Station Authority
  registerStationAuthority: async (data: RegisterAuthorityDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await axiosInstance.post('/Auth/register/station-authority', data);
    return response.data;
  },

  // Create Judge (Court Authority only)
  createJudge: async (data: CreateJudgeDto): Promise<ApiResponse<UserCreatedResponseDto>> => {
    const response = await axiosInstance.post('/Auth/create/judge', data);
    return response.data;
  },

  // Create Police Officer (Station Authority only)
  createPoliceOfficer: async (data: CreatePoliceOfficerDto): Promise<ApiResponse<UserCreatedResponseDto>> => {
    const response = await axiosInstance.post('/Auth/create/police-officer', data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: ChangePasswordDto): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post('/Auth/change-password', data);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async (): Promise<any> => {
    const response = await axiosInstance.get('/Auth/me');
    return response.data;
  },
};