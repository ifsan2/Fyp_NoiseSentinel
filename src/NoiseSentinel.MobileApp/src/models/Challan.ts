import { VehicleInputDto } from './Vehicle';
import { AccusedInputDto } from './Accused';

export interface CreateChallanDto {
  violationId: number;
  emissionReportId: number;
  vehicleId?: number;
  vehicleInput?: VehicleInputDto;
  accusedId?: number;
  accusedInput?: AccusedInputDto;
  evidencePath?: string;
  bankDetails?: string;
}

export interface ChallanResponseDto {
  challanId: number;
  officerId: number;
  officerName: string;
  officerBadgeNumber: string;
  stationName: string;
  accusedId: number;
  accusedName: string;
  accusedCnic: string;
  accusedContact?: string;
  vehicleId: number;
  vehiclePlateNumber: string;
  vehicleMake?: string;
  vehicleColor?: string;
  violationId: number;
  violationType: string;
  penaltyAmount: number;
  isCognizable: boolean;
  emissionReportId: number;
  deviceName: string;
  soundLevelDBa: number;
  mlClassification?: string;
  emissionTestDateTime: string;
  evidencePath?: string;
  issueDateTime: string;
  dueDateTime: string;
  status: string;
  bankDetails?: string;
  digitalSignatureValue: string;
  issueDateFormatted: string;
  dueDateFormatted: string;
  daysUntilDue: number;
  isOverdue: boolean;
  integrityStatus: string;
  hasFir: boolean;
  firId?: number;
}

export interface ChallanListItemDto {
  challanId: number;
  officerName: string;
  accusedName: string;
  vehiclePlateNumber: string;
  violationType: string;
  penaltyAmount: number;
  issueDateTime: string;
  dueDateTime: string;
  status: string;
  isOverdue: boolean;
  hasFir: boolean;
}