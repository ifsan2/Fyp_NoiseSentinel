import { ApiResponse } from "../models/ApiResponse";
import {
  AuthResponseDto,
  ChangePasswordDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
} from "../models/Auth";
import apiClient from "./axios.config";

class AuthApi {
  /**
   * Login
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    console.log("🔐 Attempting login with:", {
      username: credentials.username,
    });

    const response = await apiClient.post<ApiResponse<AuthResponseDto>>(
      "/Auth/login",
      credentials
    );

    console.log("📦 Full API Response:", response.data);

    // Backend returns { message: "...", data: { userId, username, token, ... } }
    if (!response.data.data) {
      console.error("❌ No data in response:", response.data);
      throw new Error(
        response.data.message || "Login failed - no data returned"
      );
    }

    return response.data.data;
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
  async changePassword(data: ChangePasswordDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponse<AuthResponseDto>>(
      "/Auth/change-password",
      data
    );
    return response.data.data!;
  }

  /**
   * Verify email with OTP and get auth token for immediate login
   */
  async verifyEmail(data: VerifyOtpDto): Promise<AuthResponseDto> {
    console.log("📧 Verifying email with OTP:", { email: data.email });
    const response = await apiClient.post<ApiResponse<AuthResponseDto>>(
      "/Auth/verify-email",
      data
    );
    console.log("✅ Email verified, received auth data:", response.data.data);
    return response.data.data!;
  }

  /**
   * Resend OTP
   */
  async resendOtp(data: ResendOtpDto): Promise<string> {
    console.log("📨 Resending OTP to:", data.email);
    const response = await apiClient.post<ApiResponse<string>>(
      "/Auth/resend-otp",
      data
    );
    return response.data.message || "OTP sent successfully";
  }
}

export default new AuthApi();
