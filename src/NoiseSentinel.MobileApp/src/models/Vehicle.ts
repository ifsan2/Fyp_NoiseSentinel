export interface VehicleInputDto {
  plateNumber: string;
  make: string;
  color?: string;
  chasisNo?: string;
  engineNo?: string;
  vehRegYear?: string; // Backend expects DateTime (ISO string format: "YYYY-MM-DDTHH:mm:ssZ")
}

export interface VehicleResponseDto {
  vehicleId: number;
  plateNumber: string;
  make?: string;
  color?: string;
  chasisNo?: string;
  engineNo?: string;
  vehRegYear?: string;
  ownerId?: number;
  ownerName?: string;
  ownerCnic?: string;
  ownerContact?: string;
  totalViolations: number;
  registrationYear: string;
}

export interface VehicleListItemDto {
  vehicleId: number;
  plateNumber: string;
  make?: string;
  color?: string;
  ownerName?: string;
  totalViolations: number;
}
