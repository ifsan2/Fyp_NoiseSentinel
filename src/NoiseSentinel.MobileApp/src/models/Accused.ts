export interface AccusedInputDto {
  fullName: string;
  cnic: string;
  city: string;
  province: string;
  address: string;
  contact: string;
}

export interface AccusedVehicleSummaryDto {
  vehicleId: number;
  plateNumber: string;
  make?: string;
  color?: string;
}

export interface AccusedResponseDto {
  accusedId: number;
  fullName: string;
  cnic: string;
  city?: string;
  province?: string;
  address?: string;
  contact?: string;
  totalViolations: number;
  totalVehicles: number;
  vehicles: AccusedVehicleSummaryDto[];
}

export interface AccusedListItemDto {
  accusedId: number;
  fullName: string;
  cnic: string;
  city?: string;
  province?: string;
  contact?: string;
  totalViolations: number;
  totalVehicles: number;
}