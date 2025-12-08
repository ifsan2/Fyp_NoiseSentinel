/**
 * Court-related TypeScript models/interfaces
 * Based on NoiseSentinel.BLL.DTOs.Court namespace
 */

// Court Type
export interface CourtType {
  courtTypeId: number;
  courtTypeName: string;
}

// Judge Summary (for court response)
export interface JudgeSummary {
  judgeId: number;
  fullName: string;
  rank: string | null;
  serviceStatus: boolean;
}

// Court List Item
export interface CourtListItem {
  courtId: number;
  courtName: string;
  courtTypeName: string;
  location: string;
  district: string;
  province: string;
  totalJudges: number;
}

// Court Response (Full Details)
export interface CourtResponse {
  courtId: number;
  courtName: string;
  courtTypeId: number;
  courtTypeName: string;
  location: string;
  district: string;
  province: string;
  totalJudges: number;
  judges: JudgeSummary[];
}

// Create Court DTO
export interface CreateCourtDto {
  courtName: string;
  courtTypeId: number;
  location: string;
  district: string;
  province: string;
}

// Update Court DTO
export interface UpdateCourtDto {
  courtId: number;
  courtName: string;
  courtTypeId: number;
  location: string;
  district: string;
  province: string;
}

// Court Statistics
export interface CourtStatistics {
  totalCourts: number;
  supremeCourts: number;
  highCourts: number;
  districtCourts: number;
  civilCourts: number;
  sessionsCourts: number;
  totalJudges: number;
  totalCases: number;
}
