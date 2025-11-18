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
    const url = stationId ? `/Fir?stationId=${stationId}` : "/Fir";

    const response = await apiClient.get<ApiResponse<FirListItemDto[]>>(url);
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
}

export default new FirApi();
