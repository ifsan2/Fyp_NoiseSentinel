import apiClient from './axios.config';
import {
  CreateEmissionReportDto,
  EmissionReportResponseDto,
  EmissionReportListItemDto,
} from '../models/EmissionReport';
import { ApiResponse } from '../models/ApiResponse';

class EmissionReportApi {
  /**
   * Create emission report
   */
  async createEmissionReport(
    data: CreateEmissionReportDto
  ): Promise<EmissionReportResponseDto> {
    const response = await apiClient.post<ApiResponse<EmissionReportResponseDto>>(
      '/EmissionReport/create',
      data
    );
    return response.data.data!;
  }

  /**
   * Get emission report by ID
   */
  async getEmissionReportById(id: number): Promise<EmissionReportResponseDto> {
    const response = await apiClient.get<ApiResponse<EmissionReportResponseDto>>(
      `/EmissionReport/${id}`
    );
    return response.data.data!;
  }

  /**
   * Get reports without challans (pending action)
   */
  async getReportsWithoutChallans(): Promise<EmissionReportListItemDto[]> {
    const response = await apiClient.get<ApiResponse<EmissionReportListItemDto[]>>(
      '/EmissionReport/pending-challans'
    );
    return response.data.data || [];
  }

  /**
   * Get all emission reports
   */
  async getAllEmissionReports(): Promise<EmissionReportListItemDto[]> {
    const response = await apiClient.get<ApiResponse<EmissionReportListItemDto[]>>(
      '/EmissionReport/list'
    );
    return response.data.data || [];
  }
}

export default new EmissionReportApi();