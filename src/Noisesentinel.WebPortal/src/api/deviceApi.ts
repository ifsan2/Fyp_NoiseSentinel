import apiClient from './axios.config';
import { DeviceDto, CreateDeviceDto, UpdateDeviceDto } from '@/models/Device';
import { ApiResponse } from '@/models/ApiResponse';

class DeviceApi {
  /**
   * Get all IoT devices
   */
  async getAllDevices(): Promise<DeviceDto[]> {
    const response = await apiClient.get<ApiResponse<DeviceDto[]>>(
      '/IotDevice/list'
    );
    return response.data.data || [];
  }

  /**
   * Get device by ID
   */
  async getDeviceById(id: number): Promise<DeviceDto> {
    const response = await apiClient.get<ApiResponse<DeviceDto>>(
      `/IotDevice/${id}`
    );
    return response.data.data!;
  }

  /**
   * Register new device
   */
  async registerDevice(data: CreateDeviceDto): Promise<DeviceDto> {
    const response = await apiClient.post<ApiResponse<DeviceDto>>(
      '/IotDevice/register',
      data
    );
    return response.data.data!;
  }

  /**
   * Update device
   */
  async updateDevice(data: UpdateDeviceDto): Promise<void> {
    await apiClient.put('/IotDevice/update', data);
  }

  /**
   * Get available devices (not paired)
   */
  async getAvailableDevices(): Promise<DeviceDto[]> {
    const response = await apiClient.get<ApiResponse<DeviceDto[]>>(
      '/IotDevice/available'
    );
    return response.data.data || [];
  }
}

export default new DeviceApi();