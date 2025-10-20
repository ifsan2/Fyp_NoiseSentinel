// Violation Type DTOs

export interface ViolationDto {
  violationId: number;
  violationName: string;
  description?: string;
  penaltyAmount: number;
  sectionOfLaw?: string;
  isCognizable: boolean;
}

export interface CreateViolationDto {
  violationName: string;
  description?: string;
  penaltyAmount: number;
  sectionOfLaw?: string;
  isCognizable: boolean;
}

export interface UpdateViolationDto {
  violationId: number;
  violationName: string;
  description?: string;
  penaltyAmount: number;
  sectionOfLaw?: string;
  isCognizable: boolean;
}

export interface ViolationSearchFilter {
  searchQuery?: string;
  isCognizable?: boolean;
  minPenalty?: number;
  maxPenalty?: number;
}