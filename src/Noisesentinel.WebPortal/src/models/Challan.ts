// Challan DTOs (if not already exists)

export interface ChallanDto {
  challanId: number;
  
  // Officer Info
  officerId: number;
  officerName?: string;
  badgeNumber?: string;
  
  // Accused Info
  accusedId: number;
  accusedName?: string;
  accusedCnic?: string;
  
  // Vehicle Info
  vehicleId: number;
  plateNumber?: string;
  vehicleMake?: string;
  
  // Violation Info
  violationId: number;
  violationName?: string;
  penaltyAmount?: number;
  isCognizable?: boolean;
  
  // Challan Details
  emissionReportId?: number;
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
  
  // Days Overdue
  daysOverdue?: number;
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