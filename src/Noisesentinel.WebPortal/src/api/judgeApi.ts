import apiClient from "./axios.config";
import { ApiResponse } from "@/models/ApiResponse";
import { JudgeDetailsDto } from "@/models/User";

interface CreateJudgeDto {
  fullName: string;
  email: string;
  username: string;
  cnic: string;
  contactNo: string;
  rank: string;
  courtId: number;
  serviceStatus: boolean;
}

interface UpdateJudgeDto {
  fullName?: string;
  email?: string;
  cnic?: string;
  contactNo?: string;
  rank?: string;
  courtId?: number;
  serviceStatus?: boolean;
}

class JudgeApi {
  /**
   * Create a new judge account (Court Authority only)
   */
  async createJudge(dto: CreateJudgeDto): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/Auth/create/judge",
      dto
    );
    return response.data.data!;
  }

  /**
   * Get all judges
   */
  async getAllJudges(): Promise<JudgeDetailsDto[]> {
    const response = await apiClient.get<ApiResponse<JudgeDetailsDto[]>>(
      "/User/judges"
    );
    return response.data.data || [];
  }

  /**
   * Get judge by user ID
   */
  async getJudgeById(userId: number): Promise<JudgeDetailsDto> {
    const response = await apiClient.get<ApiResponse<JudgeDetailsDto>>(
      `/User/${userId}`
    );
    return response.data.data!;
  }

  /**
   * Update judge details (Court Authority)
   */
  async updateJudge(judgeId: number, dto: UpdateJudgeDto): Promise<void> {
    await apiClient.put(`/User/judges/${judgeId}`, dto);
  }

  /**
   * Activate judge (Court Authority)
   */
  async activateJudge(judgeId: number): Promise<void> {
    await apiClient.put(`/User/judges/${judgeId}/activate`);
  }

  /**
   * Deactivate judge (Court Authority)
   */
  async deactivateJudge(judgeId: number): Promise<void> {
    await apiClient.put(`/User/judges/${judgeId}/deactivate`);
  }
}

const judgeApi = new JudgeApi();
export default judgeApi;
