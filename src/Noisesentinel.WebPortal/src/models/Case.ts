/**
 * Case-related TypeScript models/interfaces
 * Based on NoiseSentinel.BLL.DTOs.Case namespace
 */

// Case List Item
export interface CaseListItem {
  caseId: number;
  caseNo: string;
  caseType: string;
  caseStatus: string;
  judgeName: string;
  courtName: string;
  accusedName: string;
  violationType: string;
  hearingDate: string | null;
  verdict: string | null;
  hasCaseStatement: boolean;
}

// Case Response (Full Details with Evidence Chain)
export interface CaseResponse {
  caseId: number;
  caseNo: string;
  caseType: string;
  caseStatus: string;
  hearingDate: string | null;
  verdict: string | null;

  // Judge Details
  judgeId: number;
  judgeName: string;
  judgeDesignation: string;
  courtName: string;
  courtType: string;

  // FIR Details (Evidence)
  firId: number;
  firNo: string;
  stationName: string;
  firDateFiled: string;

  // Challan Details (Evidence)
  challanId: number;
  accusedName: string;
  accusedCnic: string;
  vehiclePlateNumber: string;
  violationType: string;
  penaltyAmount: number;

  // Emission Report Evidence
  emissionReportId: number;
  soundLevelDBa: number;
  mlClassification: string | null;
  digitalSignatureValue: string;

  // Computed Fields
  hearingDateFormatted: string;
  daysUntilHearing: number | null;
}

// Create Case DTO
export interface CreateCaseDto {
  firId: number;
  judgeId: number;
  caseType: string;
  hearingDate?: string;
}

// Update Case DTO
export interface UpdateCaseDto {
  caseId: number;
  caseStatus: string;
  hearingDate?: string;
  verdict?: string;
}

// Assign Judge DTO
export interface AssignJudgeDto {
  caseId: number;
  judgeId: number;
}

// FIR Without Case (for case creation)
export interface FirWithoutCase {
  firId: number;
  firNo: string;
  stationName: string;
  filedDateTime: string;
  challanId: number;
  vehiclePlateNumber: string;
  accusedName: string;
  violationType: string;
  soundLevelDBa: number;
}
