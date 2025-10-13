import apiClient from './axios.config';
import {
  CreateChallanDto,
  ChallanResponseDto,
  ChallanListItemDto,
} from '../models/Challan';
import { ApiResponse } from '../models/ApiResponse';

class ChallanApi {
  /**
   * Create challan (with auto-create vehicle/accused)
   */
  async createChallan(data: CreateChallanDto): Promise<ChallanResponseDto> {
    const response = await apiClient.post<ApiResponse<ChallanResponseDto>>(
      '/Challan/create',
      data
    );
    return response.data.data!;
  }

  /**
   * Get my challans (officer's own challans)
   */
  async getMyChallans(): Promise<ChallanListItemDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanListItemDto[]>>(
      '/Challan/my-challans'
    );
    return response.data.data || [];
  }

  /**
   * Get challan by ID
   */
  async getChallanById(id: number): Promise<ChallanResponseDto> {
    const response = await apiClient.get<ApiResponse<ChallanResponseDto>>(
      `/Challan/${id}`
    );
    return response.data.data!;
  }

  /**
   * Get challans by vehicle
   */
  async getChallansByVehicle(vehicleId: number): Promise<ChallanListItemDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanListItemDto[]>>(
      `/Challan/vehicle/${vehicleId}`
    );
    return response.data.data || [];
  }

  /**
   * Get challans by accused
   */
  async getChallansByAccused(accusedId: number): Promise<ChallanListItemDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanListItemDto[]>>(
      `/Challan/accused/${accusedId}`
    );
    return response.data.data || [];
  }
}

export default new ChallanApi();