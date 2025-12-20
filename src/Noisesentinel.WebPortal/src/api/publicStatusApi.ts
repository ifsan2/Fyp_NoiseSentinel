import apiClient from "./axios.config";

// ============================================================================
// PUBLIC STATUS CHECK DTOs
// ============================================================================

export interface RequestStatusOtpDto {
  vehicleNo: string;
  cnic: string;
  email: string;
}

export interface VerifyStatusOtpDto {
  vehicleNo: string;
  cnic: string;
  email: string;
  otp: string;
}

export interface StatusOtpVerificationResponseDto {
  success: boolean;
  message: string;
  accessToken: string;
  expiresAt: string;
}

export interface PublicChallanDto {
  challanId: number;
  violationType: string;
  penaltyAmount: number;
  status: string;
  issueDateTime: string;
  dueDateTime: string;
  stationName: string;
  isCognizable: boolean;
  hasFir: boolean;
  isOverdue: boolean;
}

export interface PublicFirDto {
  firId: number;
  firNo: string;
  dateFiled: string;
  status: string;
  stationName: string;
  relatedChallanId: number;
  hasCase: boolean;
}

export interface PublicCaseStatementDto {
  statementId: number;
  statementBy: string;
  statementText: string;
  statementDate: string;
}

export interface PublicCaseDto {
  caseId: number;
  caseNo: string;
  caseType: string;
  caseStatus: string;
  hearingDate?: string;
  verdict?: string;
  courtName: string;
  judgeName: string;
  firNo: string;
  statements: PublicCaseStatementDto[];
}

export interface PublicCaseStatusResponseDto {
  // Accused Information
  accusedName: string;
  cnic: string;
  contact?: string;
  address?: string;
  city?: string;
  province?: string;

  // Vehicle Information
  vehiclePlateNumber: string;
  vehicleMake?: string;
  vehicleColor?: string;
  vehicleRegYear?: string;

  // Summary Statistics
  totalChallans: number;
  unpaidChallans: number;
  totalFirs: number;
  activeCases: number;
  totalPenaltyAmount: number;
  unpaidPenaltyAmount: number;

  // Detailed Records
  challans: PublicChallanDto[];
  firs: PublicFirDto[];
  cases: PublicCaseDto[];
}

// ============================================================================
// PUBLIC STATUS API
// ============================================================================

class PublicStatusApi {
  /**
   * Request OTP for status verification
   */
  async requestStatusOtp(
    data: RequestStatusOtpDto
  ): Promise<{ success: boolean; message: string; data: string }> {
    const response = await apiClient.post("/Public/request-status-otp", data);
    return response.data;
  }

  /**
   * Verify OTP and get access token
   */
  async verifyStatusOtp(
    data: VerifyStatusOtpDto
  ): Promise<{
    success: boolean;
    message: string;
    accessToken: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post("/Public/verify-status-otp", data);
    return response.data;
  }

  /**
   * Get case status using access token
   */
  async getCaseStatus(
    token: string
  ): Promise<{
    success: boolean;
    message: string;
    data: PublicCaseStatusResponseDto;
  }> {
    const response = await apiClient.get("/Public/case-status", {
      params: { token },
    });
    return response.data;
  }

  /**
   * Download case status as JSON file
   */
  async downloadCaseStatus(token: string): Promise<Blob> {
    const response = await apiClient.get("/Public/case-status/download", {
      params: { token },
      responseType: "blob",
    });
    return response.data;
  }
}

export default new PublicStatusApi();
