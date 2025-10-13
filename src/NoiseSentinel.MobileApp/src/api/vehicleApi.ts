import apiClient from './axios.config';
import { VehicleResponseDto, VehicleListItemDto } from '../models/Vehicle';
import { ApiResponse } from '../models/ApiResponse';

class VehicleApi {
  /**
   * Search vehicle by plate number
   */
  async getVehicleByPlateNumber(plateNumber: string): Promise<VehicleResponseDto> {
    const response = await apiClient.get<ApiResponse<VehicleResponseDto>>(
      `/Vehicle/plate/${plateNumber}`
    );
    return response.data.data!;
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: number): Promise<VehicleResponseDto> {
    const response = await apiClient.get<ApiResponse<VehicleResponseDto>>(
      `/Vehicle/${id}`
    );
    return response.data.data!;
  }

  /**
   * Search vehicles by make
   */
  async searchVehiclesByMake(make: string): Promise<VehicleListItemDto[]> {
    const response = await apiClient.get<ApiResponse<VehicleListItemDto[]>>(
      `/Vehicle/search/${make}`
    );
    return response.data.data || [];
  }
}

export default new VehicleApi();