import apiClient from "./axios.config";
import {
  FirResponseDto,
  FirListItemDto,
  CognizableChallanDto,
  CreateFirDto,
  UpdateFirDto,
} from "@/models/Fir";
import { ApiResponse } from "@/models/ApiResponse";

class FirApi {
  /**
   * Get cognizable challans that can have FIR filed
   */
  async getCognizableChallans(
    stationId?: number
  ): Promise<CognizableChallanDto[]> {
    const url = stationId
      ? `/Fir/cognizable-challans?stationId=${stationId}`
      : "/Fir/cognizable-challans";

    const response = await apiClient.get<ApiResponse<CognizableChallanDto[]>>(
      url
    );
    return response.data.data || [];
  }

  /**
   * Create new FIR
   */
  async createFir(dto: CreateFirDto): Promise<FirResponseDto> {
    const response = await apiClient.post<ApiResponse<FirResponseDto>>(
      "/Fir/create",
      dto
    );
    return response.data.data!;
  }

  /**
   * Get all FIRs (with optional station filter)
   */
  async getAllFirs(stationId?: number): Promise<FirListItemDto[]> {
    // Backend exposes a dedicated 'list' endpoint for all FIRs and a 'station/{id}'
    // endpoint for station-specific FIRs. Use those to avoid 404s.
    if (stationId) {
      const response = await apiClient.get<ApiResponse<FirListItemDto[]>>(
        `/Fir/station/${stationId}`
      );
      return response.data.data || [];
    }

    const response = await apiClient.get<ApiResponse<FirListItemDto[]>>(
      "/Fir/list"
    );
    return response.data.data || [];
  }

  /**
   * Get FIR by ID
   */
  async getFirById(id: number): Promise<FirResponseDto> {
    const response = await apiClient.get<ApiResponse<FirResponseDto>>(
      `/Fir/${id}`
    );
    return response.data.data!;
  }

  /**
   * Update FIR
   */
  async updateFir(dto: UpdateFirDto): Promise<FirResponseDto> {
    const response = await apiClient.put<ApiResponse<FirResponseDto>>(
      "/Fir/update",
      dto
    );
    return response.data.data!;
  }

  /**
   * Get FIRs by station
   */
  async getFirsByStation(stationId: number): Promise<FirListItemDto[]> {
    const response = await apiClient.get<ApiResponse<FirListItemDto[]>>(
      `/Fir/station/${stationId}`
    );
    return response.data.data || [];
  }

  /**
   * Search FIRs by multiple criteria
   */
  async searchFirs(searchDto: {
    firNo?: string;
    challanId?: number;
    vehiclePlateNumber?: string;
    accusedCnic?: string;
    accusedName?: string;
    firStatus?: string;
    stationId?: number;
    dateFiledFrom?: string;
    dateFiledTo?: string;
    hasCase?: boolean;
  }): Promise<{ message: string; count: number; data: FirListItemDto[] }> {
    const response = await apiClient.post<{
      message: string;
      count: number;
      data: FirListItemDto[];
    }>("/Fir/search", searchDto);
    return response.data;
  }
}

export default new FirApi();
