export interface CreateEmissionReportDto {
  deviceId: number;
  co?: number;
  co2?: number;
  hc?: number;
  nox?: number;
  soundLevelDBa: number;
  testDateTime: string;
  mlClassification?: string;
}

export interface EmissionReportResponseDto {
  emissionReportId: number;
  deviceId: number;
  deviceName: string;
  co?: number;
  co2?: number;
  hc?: number;
  nox?: number;
  soundLevelDBa: number;
  testDateTime: string;
  mlClassification?: string;
  digitalSignatureValue: string;
  isViolation: boolean;
  legalSoundLimit: number;
  excessSound?: number;
  hasChallan: boolean;
  challanId?: number;
  integrityStatus: string;
  testDateTimeFormatted: string;
}

export interface EmissionReportListItemDto {
  emissionReportId: number;
  deviceName: string;
  soundLevelDBa: number;
  testDateTime: string;
  mlClassification?: string;
  isViolation: boolean;
  hasChallan: boolean;
  status: string;
}