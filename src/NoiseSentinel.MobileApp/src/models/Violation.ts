export interface ViolationResponseDto {
  violationId: number;
  violationType: string;
  description: string;
  penaltyAmount: number;
  sectionOfLaw?: string;
  isCognizable: boolean;
  totalChallans: number;
  cognizableStatus: string;
}

export interface ViolationListItemDto {
  violationId: number;
  violationType: string;
  description: string;
  penaltyAmount: number;
  isCognizable: boolean;
  totalChallans: number;
}