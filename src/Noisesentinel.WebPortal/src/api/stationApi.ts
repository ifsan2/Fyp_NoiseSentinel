import apiClient from './axios.config';
import {
  PoliceStationDto,
  CreatePoliceStationDto,
  UpdatePoliceStationDto,
} from '@/models/Station';
import { ApiResponse } from '@/models/ApiResponse';

class StationApi {
  /**
   * Get all police stations
   */
  async getAllStations(): Promise<PoliceStationDto[]> {
    const response = await apiClient.get<ApiResponse<PoliceStationDto[]>>(
      '/Policestation/list'
    );
    return response.data.data || [];
  }

  /**
   * Get station by ID
   */
  async getStationById(id: number): Promise<PoliceStationDto> {
    const response = await apiClient.get<ApiResponse<PoliceStationDto>>(
      `/Policestation/${id}`
    );
    return response.data.data!;
  }

  /**
   * Create new police station
   */
  async createStation(data: CreatePoliceStationDto): Promise<PoliceStationDto> {
    const response = await apiClient.post<ApiResponse<PoliceStationDto>>(
      '/Policestation/create',
      data
    );
    return response.data.data!;
  }

  /**
   * Update police station
   */
  async updateStation(data: UpdatePoliceStationDto): Promise<void> {
    await apiClient.put('/Policestation/update', data);
  }

  /**
   * Delete police station
   */
  async deleteStation(id: number): Promise<void> {
    await apiClient.delete(`/Policestation/delete/${id}`);
  }

  /**
   * Get station by code
   */
  async getStationByCode(code: string): Promise<PoliceStationDto> {
    const response = await apiClient.get<ApiResponse<PoliceStationDto>>(
      `/Policestation/code/${code}`
    );
    return response.data.data!;
  }

  /**
   * Get stations by district
   */
  async getStationsByDistrict(district: string): Promise<PoliceStationDto[]> {
    const response = await apiClient.get<ApiResponse<PoliceStationDto[]>>(
      `/Policestation/district/${district}`
    );
    return response.data.data || [];
  }
}

export default new StationApi();