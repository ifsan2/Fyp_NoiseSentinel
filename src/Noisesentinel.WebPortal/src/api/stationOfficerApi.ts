import axiosInstance from "./axios.config";
import {
  PoliceOfficerDetailsDto,
  CreateStationOfficerDto,
  UpdateStationOfficerDto,
} from "@/models/User";
import { ApiResponse } from "@/models/ApiResponse";

class StationOfficerApi {
  /**
   * Create police officer (with station assignment)
   */
  async createOfficer(data: CreateStationOfficerDto): Promise<any> {
    const response = await axiosInstance.post<ApiResponse>(
      "/Auth/create/police-officer",
      data
    );
    return response.data.data!;
  }

  /**
   * Get all police officers (system-wide)
   */
  async getAllOfficers(): Promise<PoliceOfficerDetailsDto[]> {
    const response = await axiosInstance.get<
      ApiResponse<PoliceOfficerDetailsDto[]>
    >("/User/police-officers");
    return response.data.data || [];
  }

  /**
   * Update police officer
   */
  async updateOfficer(
    officerId: number,
    data: UpdateStationOfficerDto
  ): Promise<void> {
    await axiosInstance.put(`/User/officers/${officerId}`, data);
  }

  /**
   * Delete police officer
   */
  async deleteOfficer(officerId: number): Promise<void> {
    await axiosInstance.delete(`/User/officers/${officerId}`);
  }

  /**
   * Get officer by ID
   */
  async getOfficerById(userId: number): Promise<any> {
    const response = await axiosInstance.get<ApiResponse>(`/User/${userId}`);
    return response.data.data!;
  }
}

export default new StationOfficerApi();
