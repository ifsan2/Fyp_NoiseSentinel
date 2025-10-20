import apiClient from './axios.config';
import { ChallanDto } from '@/models/Challan';
import { ApiResponse } from '@/models/ApiResponse';

class ChallanApi {
  /**
   * Get all challans
   */
  async getAllChallans(): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      '/Challan/list'
    );
    return response.data.data || [];
  }

  /**
   * Get challan by ID
   */
  async getChallanById(id: number): Promise<ChallanDto> {
    const response = await apiClient.get<ApiResponse<ChallanDto>>(
      `/Challan/${id}`
    );
    return response.data.data!;
  }

  /**
   * Get challans by station
   */
  async getChallansByStation(stationId: number): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      `/Challan/station/${stationId}`
    );
    return response.data.data || [];
  }

  /**
   * Get challans by status
   */
  async getChallansByStatus(status: string): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      `/Challan/status/${status}`
    );
    return response.data.data || [];
  }

  /**
   * Get overdue challans
   */
  async getOverdueChallans(): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      '/Challan/overdue'
    );
    return response.data.data || [];
  }

  /**
   * Get challans by vehicle
   */
  async getChallansByVehicle(vehicleId: number): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      `/Challan/vehicle/${vehicleId}`
    );
    return response.data.data || [];
  }

  /**
   * Get challans by accused
   */
  async getChallansByAccused(accusedId: number): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      `/Challan/accused/${accusedId}`
    );
    return response.data.data || [];
  }
}

export default new ChallanApi();