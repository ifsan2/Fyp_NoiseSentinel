// Violation Type DTOs

export interface ViolationDto {
  violationId: number;
  violationType: string;
  description?: string;
  penaltyAmount: number;
  sectionOfLaw?: string;
  isCognizable: boolean;
  totalChallans?: number;
}

export interface CreateViolationDto {
  violationType: string;
  description?: string;
  penaltyAmount: number;
  sectionOfLaw?: string;
  isCognizable: boolean;
}

export interface UpdateViolationDto {
  violationId: number;
  violationType: string;
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
