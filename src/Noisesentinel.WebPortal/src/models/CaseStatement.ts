/**
 * Case Statement-related TypeScript models/interfaces
 * Based on NoiseSentinel.BLL.DTOs.CaseStatement namespace
 */

// Case Statement List Item
export interface CaseStatementListItem {
  statementId: number;
  caseId: number;
  caseNo: string;
  statementBy: string;
  statementDate: string;
  judgeName: string;
  courtName: string;
  statementPreview: string; // First 100 characters
}

// Case Statement Response (Full Details)
export interface CaseStatementResponse {
  statementId: number;
  caseId: number;
  caseNo: string;
  statementBy: string;
  statementText: string;
  statementDate: string;

  // Case Details
  caseType: string;
  caseStatus: string;
  judgeName: string;
  courtName: string;

  // Accused Details
  accusedName: string;
  vehiclePlateNumber: string;
  violationType: string;

  // Computed Fields
  statementDateFormatted: string;
  daysSinceStatement: number;
}

// Create Case Statement DTO
export interface CreateCaseStatementDto {
  caseId: number;
  statementText: string;
  statementBy: string;
}

// Update Case Statement DTO
export interface UpdateCaseStatementDto {
  statementId: number;
  statementText: string;
}
