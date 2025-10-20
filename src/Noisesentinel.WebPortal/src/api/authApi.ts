import apiClient from "./axios.config";
import {
  LoginDto,
  AuthResponseDto,
  RegisterAdminDto,
  CreateAdminDto,
  CreateCourtAuthorityDto,
  CreateStationAuthorityDto,
  ChangePasswordDto,
  UserCreatedResponseDto,
} from "@/models/Auth";
import { ApiResponse } from "@/models/ApiResponse";

class AuthApi {
  /**
   * Login
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponse<AuthResponseDto>>(
      "/Auth/login",
      credentials
    );
    return response.data.data!;
  }

  /**
   * Register first admin (public endpoint)
   */
  async registerAdmin(data: RegisterAdminDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponse<AuthResponseDto>>(
      "/Auth/register/admin",
      data
    );
    return response.data.data!;
  }

  /**
   * Create additional admin (by existing admin)
   */
  async createAdmin(data: CreateAdminDto): Promise<UserCreatedResponseDto> {
    const response = await apiClient.post<ApiResponse<UserCreatedResponseDto>>(
      "/Auth/admin/create/admin",
      data
    );
    return response.data.data!;
  }

  /**
   * Create Court Authority (by admin)
   */
  async createCourtAuthority(
    data: CreateCourtAuthorityDto
  ): Promise<UserCreatedResponseDto> {
    const response = await apiClient.post<ApiResponse<UserCreatedResponseDto>>(
      "/Auth/admin/create/court-authority",
      data
    );
    return response.data.data!;
  }

  /**
   * Create Station Authority (by admin)
   */
  async createStationAuthority(
    data: CreateStationAuthorityDto
  ): Promise<UserCreatedResponseDto> {
    const response = await apiClient.post<ApiResponse<UserCreatedResponseDto>>(
      "/Auth/admin/create/station-authority",
      data
    );
    return response.data.data!;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get<ApiResponse>("/Auth/me");
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.post("/Auth/change-password", data);
  }

  /**
   * Check backend connectivity and health
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try a simple GET request to check if backend is accessible
      const response = await apiClient.get("/Health", { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error("🏥 Backend Health Check Failed:", error);
      return false;
    }
  }
}

export default new AuthApi();
