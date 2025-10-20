import apiClient from './axios.config';
import { AccusedResponseDto, AccusedListItemDto } from '../models/Accused';
import { ApiResponse } from '../models/ApiResponse';

class AccusedApi {
  /**
   * Search accused by CNIC
   */
  async getAccusedByCnic(cnic: string): Promise<AccusedResponseDto> {
    const response = await apiClient.get<ApiResponse<AccusedResponseDto>>(
      `/Accused/cnic/${cnic}`
    );
    return response.data.data!;
  }

  /**
   * Get accused by ID
   */
  async getAccusedById(id: number): Promise<AccusedResponseDto> {
    const response = await apiClient.get<ApiResponse<AccusedResponseDto>>(
      `/Accused/${id}`
    );
    return response.data.data!;
  }

  /**
   * Search accused by name
   */
  async searchAccusedByName(name: string): Promise<AccusedListItemDto[]> {
    const response = await apiClient.get<ApiResponse<AccusedListItemDto[]>>(
      `/Accused/search/${name}`
    );
    return response.data.data || [];
  }
}

export default new AccusedApi();