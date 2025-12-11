import apiClient from "./axios.config";
import { ApiResponse } from "@/models/ApiResponse";
import {
  CaseListItem,
  CaseResponse,
  CreateCaseDto,
  UpdateCaseDto,
  AssignJudgeDto,
  FirWithoutCase,
} from "@/models/Case";

class CaseApi {
  /**
   * Create a new case from FIR (Court Authority only)
   */
  async createCase(dto: CreateCaseDto): Promise<CaseResponse> {
    const response = await apiClient.post<ApiResponse<CaseResponse>>(
      "/Case/create",
      dto
    );
    return response.data.data!;
  }

  /**
   * Get case by ID
   */
  async getCaseById(caseId: number): Promise<CaseResponse> {
    const response = await apiClient.get<ApiResponse<CaseResponse>>(
      `/Case/${caseId}`
    );
    return response.data.data!;
  }

  /**
   * Get case by case number
   */
  async getCaseByCaseNo(caseNo: string): Promise<CaseResponse> {
    const response = await apiClient.get<ApiResponse<CaseResponse>>(
      `/Case/number/${encodeURIComponent(caseNo)}`
    );
    return response.data.data!;
  }

  /**
   * Get all cases (Court Authority)
   */
  async getAllCases(): Promise<CaseListItem[]> {
    const response = await apiClient.get<ApiResponse<CaseListItem[]>>(
      "/Case/list"
    );
    return response.data.data || [];
  }

  /**
   * Get cases assigned to a specific judge
   */
  async getCasesByJudge(judgeId: number): Promise<CaseListItem[]> {
    const response = await apiClient.get<ApiResponse<CaseListItem[]>>(
      `/Case/judge/${judgeId}`
    );
    return response.data.data || [];
  }

  /**
   * Get my assigned cases (Judge only)
   */
  async getMyCases(): Promise<CaseListItem[]> {
    const response = await apiClient.get<ApiResponse<CaseListItem[]>>(
      "/Case/my-cases"
    );
    return response.data.data || [];
  }

  /**
   * Get cases by status
   */
  async getCasesByStatus(status: string): Promise<CaseListItem[]> {
    const response = await apiClient.get<ApiResponse<CaseListItem[]>>(
      `/Case/status/${encodeURIComponent(status)}`
    );
    return response.data.data || [];
  }

  /**
   * Get FIRs without cases (available for case creation)
   */
  async getFirsWithoutCases(): Promise<FirWithoutCase[]> {
    const response = await apiClient.get<ApiResponse<FirWithoutCase[]>>(
      "/Case/firs-without-cases"
    );
    return response.data.data || [];
  }

  /**
   * Update case details (Court Authority or Judge)
   */
  async updateCase(dto: UpdateCaseDto): Promise<CaseResponse> {
    const response = await apiClient.put<ApiResponse<CaseResponse>>(
      "/Case/update",
      dto
    );
    return response.data.data!;
  }

  /**
   * Assign/Reassign judge to case (Court Authority only)
   */
  async assignJudge(dto: AssignJudgeDto): Promise<CaseResponse> {
    const response = await apiClient.put<ApiResponse<CaseResponse>>(
      "/Case/assign-judge",
      dto
    );
    return response.data.data!;
  }

  /**
   * Delete case (Court Authority only)
   */
  async deleteCase(caseId: number): Promise<void> {
    await apiClient.delete(`/Case/delete/${caseId}`);
  }
}

const caseApi = new CaseApi();
export default caseApi;
