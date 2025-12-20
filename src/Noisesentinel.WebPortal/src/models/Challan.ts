// Challan DTOs (if not already exists)

export interface ChallanDto {
  challanId: number;

  // Officer Info
  officerId?: number;
  officerName?: string;
  badgeNumber?: string;
  officerBadgeNumber?: string;
  officerRank?: string;

  // Accused Info
  accusedId: number;
  accusedName?: string;
  accusedCnic?: string;
  accusedContact?: string;
  accusedAddress?: string;
  accusedCity?: string;
  accusedProvince?: string;
  accusedEmail?: string;

  // Vehicle Info
  vehicleId: number;
  plateNumber?: string;
  vehiclePlateNumber?: string; // Backend uses this property name
  vehicleMake?: string;
  vehicleColor?: string;
  vehicleMakeYear?: string;

  // Violation Info
  violationId: number;
  violationType?: string;
  penaltyAmount?: number;
  isCognizable?: boolean;

  // Emission Report (Evidence)
  emissionReportId?: number;
  deviceName?: string;
  soundLevelDBa?: number;
  mlClassification?: string;
  emissionTestDateTime?: string;

  // Challan Details
  evidencePath?: string;
  issueDateTime: string;
  dueDateTime: string;
  status: string;
  bankDetails?: string;
  digitalSignatureValue?: string;

  // Station Info
  stationId?: number;
  stationName?: string;

  // FIR Info
  hasFir: boolean;
  firId?: number;

  // Computed Fields
  issueDateFormatted?: string;
  dueDateFormatted?: string;
  daysUntilDue?: number;
  daysOverdue?: number;
  isOverdue?: boolean;
  integrityStatus?: string;
}

export interface ChallanSearchFilter {
  searchQuery?: string;
  stationIds?: number[];
  status?: string[];
  violationIds?: number[];
  isOverdue?: boolean;
  hasFir?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  penaltyRange?: {
    min: number;
    max: number;
  };
}
