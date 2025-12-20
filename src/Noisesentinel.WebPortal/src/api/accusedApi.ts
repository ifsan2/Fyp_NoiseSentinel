import apiClient from "./axios.config";
import { ApiResponse } from "@/models/ApiResponse";

export interface AccusedDto {
  accusedId: number;
  fullName: string;
  cnic: string;
  contactNo?: string;
  address?: string;
  city?: string;
  province?: string;
  email?: string;
  totalChallans?: number;
  totalPenalties?: number;
  hasPendingChallans?: boolean;
}

class AccusedApi {
  /**
   * Get all accused
   */
  async getAllAccused(): Promise<AccusedDto[]> {
    const response = await apiClient.get<ApiResponse<AccusedDto[]>>(
      "/Accused/list"
    );
    return response.data.data || [];
  }

  /**
   * Get accused by ID
   */
  async getAccusedById(id: number): Promise<AccusedDto> {
    const response = await apiClient.get<ApiResponse<AccusedDto>>(
      `/Accused/${id}`
    );
    return response.data.data!;
  }

  /**
   * Search accused by CNIC
   */
  async searchByCnic(cnic: string): Promise<AccusedDto> {
    const response = await apiClient.get<ApiResponse<AccusedDto>>(
      `/Accused/cnic/${cnic}`
    );
    return response.data.data!;
  }
}

export default new AccusedApi();
