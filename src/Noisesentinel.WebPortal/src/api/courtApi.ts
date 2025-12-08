import apiClient from "./axios.config";
import { ApiResponse } from "@/models/ApiResponse";
import {
  CourtListItem,
  CourtResponse,
  CreateCourtDto,
  UpdateCourtDto,
  CourtType,
} from "@/models/Court";

class CourtApi {
  /**
   * Get all court types (Supreme Court, High Court, etc.)
   */
  async getCourtTypes(): Promise<CourtType[]> {
    const response = await apiClient.get<ApiResponse<CourtType[]>>(
      "/Court/types"
    );
    return response.data.data || [];
  }

  /**
   * Create a new court (Court Authority only)
   */
  async createCourt(dto: CreateCourtDto): Promise<CourtResponse> {
    const response = await apiClient.post<ApiResponse<CourtResponse>>(
      "/Court/create",
      dto
    );
    return response.data.data!;
  }

  /**
   * Get court by ID
   */
  async getCourtById(courtId: number): Promise<CourtResponse> {
    const response = await apiClient.get<ApiResponse<CourtResponse>>(
      `/Court/${courtId}`
    );
    return response.data.data!;
  }

  /**
   * Get all courts
   */
  async getAllCourts(): Promise<CourtListItem[]> {
    const response = await apiClient.get<ApiResponse<CourtListItem[]>>(
      "/Court/list"
    );
    return response.data.data || [];
  }

  /**
   * Get courts by type
   */
  async getCourtsByType(courtTypeId: number): Promise<CourtListItem[]> {
    const response = await apiClient.get<ApiResponse<CourtListItem[]>>(
      `/Court/type/${courtTypeId}`
    );
    return response.data.data || [];
  }

  /**
   * Get courts by province
   */
  async getCourtsByProvince(province: string): Promise<CourtListItem[]> {
    const response = await apiClient.get<ApiResponse<CourtListItem[]>>(
      `/Court/province/${encodeURIComponent(province)}`
    );
    return response.data.data || [];
  }

  /**
   * Update court details (Court Authority only)
   */
  async updateCourt(dto: UpdateCourtDto): Promise<void> {
    await apiClient.put("/Court/update", dto);
  }

  /**
   * Delete court (Court Authority only)
   */
  async deleteCourt(courtId: number): Promise<void> {
    await apiClient.delete(`/Court/delete/${courtId}`);
  }
}

const courtApi = new CourtApi();
export default courtApi;
