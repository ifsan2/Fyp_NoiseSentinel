import apiClient from './axios.config';
import {
  IotDeviceListItemDto,
  IotDeviceResponseDto,
  PairIotDeviceDto,
} from '../models/IotDevice';
import { ApiResponse } from '../models/ApiResponse';

class IotDeviceApi {
  /**
   * Get available devices for pairing
   */
  async getAvailableDevices(): Promise<IotDeviceListItemDto[]> {
    const response = await apiClient.get<ApiResponse<IotDeviceListItemDto[]>>(
      '/IotDevice/available'
    );
    return response.data.data || [];
  }

  /**
   * Get device by ID
   */
  async getDeviceById(id: number): Promise<IotDeviceResponseDto> {
    const response = await apiClient.get<ApiResponse<IotDeviceResponseDto>>(
      `/IotDevice/${id}`
    );
    return response.data.data!;
  }

  /**
   * Pair with device (Bluetooth simulation)
   */
  async pairDevice(data: PairIotDeviceDto): Promise<string> {
    const response = await apiClient.post<ApiResponse<string>>(
      '/IotDevice/pair',
      data
    );
    return response.data.message || 'Device paired successfully';
  }
}

export default new IotDeviceApi();