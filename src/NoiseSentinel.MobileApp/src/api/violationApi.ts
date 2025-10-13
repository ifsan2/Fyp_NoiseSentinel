import apiClient from './axios.config';
import { ViolationResponseDto, ViolationListItemDto } from '../models/Violation';
import { ApiResponse } from '../models/ApiResponse';

class ViolationApi {
  /**
   * Get all violations
   */
  async getAllViolations(): Promise<ViolationListItemDto[]> {
    const response = await apiClient.get<ApiResponse<ViolationListItemDto[]>>(
      '/Violation/list'
    );
    return response.data.data || [];
  }

  /**
   * Get violation by ID
   */
  async getViolationById(id: number): Promise<ViolationResponseDto> {
    const response = await apiClient.get<ApiResponse<ViolationResponseDto>>(
      `/Violation/${id}`
    );
    return response.data.data!;
  }

  /**
   * Search violations by type
   */
  async searchViolationsByType(type: string): Promise<ViolationListItemDto[]> {
    const response = await apiClient.get<ApiResponse<ViolationListItemDto[]>>(
      `/Violation/search/${type}`
    );
    return response.data.data || [];
  }
}

export default new ViolationApi();