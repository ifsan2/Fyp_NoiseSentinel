import apiClient from "./axios.config";
import {
  IotDeviceListItemDto,
  IotDeviceResponseDto,
  PairIotDeviceDto,
} from "../models/IotDevice";
import { ApiResponse } from "../models/ApiResponse";

class IotDeviceApi {
  /**
   * Get available devices for pairing
   */
  async getAvailableDevices(): Promise<IotDeviceListItemDto[]> {
    const response = await apiClient.get<ApiResponse<IotDeviceListItemDto[]>>(
      "/IotDevice/available"
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
      "/IotDevice/pair",
      data
    );
    return response.data.message || "Device paired successfully";
  }

  /**
   * Get currently paired device for logged-in officer
   */
  async getPairedDevice(): Promise<IotDeviceResponseDto | null> {
    try {
      const response = await apiClient.get<ApiResponse<IotDeviceResponseDto>>(
        "/IotDevice/my-paired-device"
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Get paired device error:", error);
      return null;
    }
  }

  /**
   * Unpair current device
   */
  async unpairDevice(): Promise<boolean> {
    try {
      const response = await apiClient.post<any>("/IotDevice/unpair");
      console.log("Unpair response:", response.data);
      // Backend returns { message: "...", status: "Unpaired" }
      return response.data && response.data.status === "Unpaired";
    } catch (error: any) {
      console.error("Unpair device error:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  }
}

export default new IotDeviceApi();
