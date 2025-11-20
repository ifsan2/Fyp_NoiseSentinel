// FIR DTOs

export interface CreateFirDto {
  challanId: number;
  firDescription: string;
  investigationReport?: string;
}

export interface FirResponseDto {
  firId: number;
  firNo: string;
  // Station Details
  stationId: number;
  stationName: string;
  stationCode: string;
  // Challan Details (Evidence)
  challanId: number;
  accusedName: string;
  accusedCnic: string;
  vehiclePlateNumber: string;
  violationType: string;
  isCognizable: boolean;
  penaltyAmount: number;
  // Emission Report Evidence
  emissionReportId: number;
  soundLevelDBa: number;
  mlClassification?: string;
  digitalSignatureValue: string;
  // Informant (Police Officer)
  informantId: number;
  informantName: string;
  informantBadgeNumber: string;
  // FIR Specific
  dateFiled: string;
  firDescription: string;
  firStatus: string;
  investigationReport?: string;
  // Computed Fields
  dateFiledFormatted: string;
  daysSinceFiled: number;
  hasCase: boolean;
  caseId?: number;
  evidenceChain: string;
}

export interface FirListItemDto {
  firId: number;
  firNo: string;
  stationName: string;
  stationId?: number; // Added for filtering
  accusedName: string;
  accusedCnic: string;
  vehiclePlateNumber: string;
  violationType: string;
  soundLevelDBa: number;
  dateFiled: string;
  firStatus: string;
  daysSinceFiled: number;
  hasCase: boolean;
}

// Alias for backward compatibility
export type FirDto = FirListItemDto;

export interface CognizableChallanDto {
  challanId: number;
  officerName: string;
  accusedName: string;
  accusedCnic: string;
  vehiclePlateNumber: string;
  violationType: string;
  penaltyAmount: number;
  issueDateTime: string;
  soundLevelDBa: number;
  mlClassification?: string;
  hasFir: boolean;
  recommendation: string;
}

export interface UpdateFirDto {
  firId: number;
  firStatus: string;
  investigationReport?: string;
}
