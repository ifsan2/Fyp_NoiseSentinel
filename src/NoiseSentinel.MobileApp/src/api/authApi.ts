import { ApiResponse } from "../models/ApiResponse";
import { AuthResponseDto, ChangePasswordDto, LoginDto } from "../models/Auth";
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
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.post("/Auth/change-password", data);
  }
}

export default new AuthApi();
