import apiClient from './axios.config';
import {
  ViolationDto,
  CreateViolationDto,
  UpdateViolationDto,
} from '@/models/Violation';
import { ApiResponse } from '@/models/ApiResponse';

class ViolationApi {
  /**
   * Get all violations
   */
  async getAllViolations(): Promise<ViolationDto[]> {
    const response = await apiClient.get<ApiResponse<ViolationDto[]>>(
      '/Violation/list'
    );
    return response.data.data || [];
  }

  /**
   * Get violation by ID
   */
  async getViolationById(id: number): Promise<ViolationDto> {
    const response = await apiClient.get<ApiResponse<ViolationDto>>(
      `/Violation/${id}`
    );
    return response.data.data!;
  }

  /**
   * Create violation
   */
  async createViolation(data: CreateViolationDto): Promise<ViolationDto> {
    const response = await apiClient.post<ApiResponse<ViolationDto>>(
      '/Violation/create',
      data
    );
    return response.data.data!;
  }

  /**
   * Update violation
   */
  async updateViolation(data: UpdateViolationDto): Promise<void> {
    await apiClient.put('/Violation/update', data);
  }

  /**
   * Delete violation
   */
  async deleteViolation(id: number): Promise<void> {
    await apiClient.delete(`/Violation/delete/${id}`);
  }
}

export default new ViolationApi();