import apiClient from './axios.config';
import { ApiResponse } from '@/models/ApiResponse';

export interface VehicleDto {
  vehicleId: number;
  plateNumber: string;
  make?: string;
  model?: string;
  color?: string;
  registrationYear?: number;
  ownerName?: string;
  ownerCnic?: string;
  ownerContact?: string;
  totalChallans?: number;
  totalPenalties?: number;
}

class VehicleApi {
  /**
   * Get all vehicles
   */
  async getAllVehicles(): Promise<VehicleDto[]> {
    const response = await apiClient.get<ApiResponse<VehicleDto[]>>(
      '/Vehicle/list'
    );
    return response.data.data || [];
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: number): Promise<VehicleDto> {
    const response = await apiClient.get<ApiResponse<VehicleDto>>(
      `/Vehicle/${id}`
    );
    return response.data.data!;
  }

  /**
   * Search vehicle by plate number
   */
  async searchByPlate(plateNumber: string): Promise<VehicleDto> {
    const response = await apiClient.get<ApiResponse<VehicleDto>>(
      `/Vehicle/plate/${plateNumber}`
    );
    return response.data.data!;
  }
}

export default new VehicleApi();