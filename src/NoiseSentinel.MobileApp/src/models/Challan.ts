import { VehicleInputDto } from "./Vehicle";
import { AccusedInputDto } from "./Accused";

export interface CreateChallanDto {
  violationId: number;
  emissionReportId: number | null; // Nullable - null for direct challans, set for emission report challans
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
  emissionReportId?: number | null; // Optional - only present for emission report challans
  deviceName?: string | null;
  soundLevelDBa?: number | null;
  mlClassification?: string | null;
  emissionTestDateTime?: string | null;
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
