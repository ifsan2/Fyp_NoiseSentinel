// FIR DTOs

export interface FirDto {
  firid: number;
  firNumber: string;
  
  // Challan Info
  challanId: number;
  challanNumber?: string;
  
  // Station Info
  stationId: number;
  stationName: string;
  stationCode?: string;
  
  // Informant (Officer)
  informantId: number;
  informantName?: string;
  informantBadge?: string;
  
  // Details
  description?: string;
  filedDate: string;
  status: string;
  
  // Accused & Vehicle
  accusedName?: string;
  accusedCnic?: string;
  vehiclePlate?: string;
  violationName?: string;
  
  // Case Info
  hasCase: boolean;
  caseId?: number;
  caseNumber?: string;
  caseStatus?: string;
}

export interface CreateFirDto {
  challanId: number;
  stationId: number;
  informantId: number;
  description?: string;
  filedDate: string;
}

export interface UpdateFirDto {
  firid: number;
  status: string;
  description?: string;
}

export interface FirSearchFilter {
  searchQuery?: string;
  stationIds?: number[];
  status?: string[];
  hasCase?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}