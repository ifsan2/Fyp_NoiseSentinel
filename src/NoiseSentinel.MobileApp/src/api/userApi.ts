import { ApiResponse } from "../models/ApiResponse";
import { UserDetailsDto } from "../models/Auth";
import apiClient from "./axios.config";

class UserApi {
  /**
   * Get current user's full profile details
   */
  async getCurrentUserDetails(): Promise<UserDetailsDto> {
    const response = await apiClient.get<ApiResponse<UserDetailsDto>>(
      `/Auth/me`
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to get user details");
    }
    
    return response.data.data;
  }
}

export default new UserApi();
