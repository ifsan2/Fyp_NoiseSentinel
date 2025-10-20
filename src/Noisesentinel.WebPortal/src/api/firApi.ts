import apiClient from './axios.config';
import { FirDto } from '@/models/Fir';
import { ApiResponse } from '@/models/ApiResponse';

class FirApi {
  /**
   * Get all FIRs
   */
  async getAllFirs(): Promise<FirDto[]> {
    const response = await apiClient.get<ApiResponse<FirDto[]>>('/Fir/list');
    return response.data.data || [];
  }

  /**
   * Get FIR by ID
   */
  async getFirById(id: number): Promise<FirDto> {
    const response = await apiClient.get<ApiResponse<FirDto>>(`/Fir/${id}`);
    return response.data.data!;
  }

  /**
   * Get FIRs by station
   */
  async getFirsByStation(stationId: number): Promise<FirDto[]> {
    const response = await apiClient.get<ApiResponse<FirDto[]>>(
      `/Fir/station/${stationId}`
    );
    return response.data.data || [];
  }
}

export default new FirApi();