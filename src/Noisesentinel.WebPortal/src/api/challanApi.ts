import apiClient from "./axios.config";
import { ChallanDto } from "@/models/Challan";
import { ApiResponse } from "@/models/ApiResponse";

class ChallanApi {
  /**
   * Get all challans
   */
  async getAllChallans(): Promise<ChallanDto[]> {
    const response = await apiClient.get<ApiResponse<ChallanDto[]>>(
      "/Challan/list"
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
      "/Challan/overdue"
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

  /**
   * Public search: Search challans by vehicle plate number and CNIC
   * No authentication required
   */
  async searchChallansByPlateAndCnic(
    plateNumber: string,
    cnic: string
  ): Promise<ChallanDto[]> {
    const response = await apiClient.post<ApiResponse<ChallanDto[]>>(
      "/Challan/public/search",
      {
        plateNumber,
        cnic,
      }
    );
    return response.data.data || [];
  }

  /**
   * Advanced search: Search challans by multiple criteria (Station Authority only)
   */
  async searchChallans(searchDto: {
    vehiclePlateNumber?: string;
    accusedCnic?: string;
    accusedName?: string;
    vehicleMake?: string;
    vehicleMakeYear?: number;
    status?: string;
    violationType?: string;
    stationId?: number;
    officerId?: number;
    issueDateFrom?: string;
    issueDateTo?: string;
  }): Promise<{ message: string; count: number; data: ChallanDto[] }> {
    const response = await apiClient.post<{
      message: string;
      count: number;
      data: ChallanDto[];
    }>("/Challan/search", searchDto);
    return response.data;
  }
}

export default new ChallanApi();
