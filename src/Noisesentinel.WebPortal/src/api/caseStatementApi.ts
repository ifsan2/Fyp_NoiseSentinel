import apiClient from "./axios.config";
import { ApiResponse } from "@/models/ApiResponse";
import {
  CaseStatementListItem,
  CaseStatementResponse,
  CreateCaseStatementDto,
  UpdateCaseStatementDto,
} from "@/models/CaseStatement";

class CaseStatementApi {
  /**
   * Create a new case statement (Judge only)
   */
  async createCaseStatement(
    dto: CreateCaseStatementDto
  ): Promise<CaseStatementResponse> {
    const response = await apiClient.post<ApiResponse<CaseStatementResponse>>(
      "/CaseStatement/create",
      dto
    );
    return response.data.data!;
  }

  /**
   * Get case statement by ID
   */
  async getCaseStatementById(
    statementId: number
  ): Promise<CaseStatementResponse> {
    const response = await apiClient.get<ApiResponse<CaseStatementResponse>>(
      `/CaseStatement/${statementId}`
    );
    return response.data.data!;
  }

  /**
   * Get all case statements for a specific case
   */
  async getStatementsByCase(
    caseId: number
  ): Promise<CaseStatementListItem[]> {
    const response = await apiClient.get<
      ApiResponse<CaseStatementListItem[]>
    >(`/CaseStatement/case/${caseId}`);
    return response.data.data || [];
  }

  /**
   * Get latest statement for a case
   */
  async getLatestStatementByCase(
    caseId: number
  ): Promise<CaseStatementResponse> {
    const response = await apiClient.get<ApiResponse<CaseStatementResponse>>(
      `/CaseStatement/case/${caseId}/latest`
    );
    return response.data.data!;
  }

  /**
   * Get all case statements (Court Authority)
   */
  async getAllCaseStatements(): Promise<CaseStatementListItem[]> {
    const response = await apiClient.get<
      ApiResponse<CaseStatementListItem[]>
    >("/CaseStatement/list");
    return response.data.data || [];
  }

  /**
   * Update case statement (Judge only)
   */
  async updateCaseStatement(dto: UpdateCaseStatementDto): Promise<void> {
    await apiClient.put("/CaseStatement/update", dto);
  }

  /**
   * Delete case statement (Judge only)
   */
  async deleteCaseStatement(statementId: number): Promise<void> {
    await apiClient.delete(`/CaseStatement/delete/${statementId}`);
  }
}

const caseStatementApi = new CaseStatementApi();
export default caseStatementApi;
