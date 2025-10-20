// Police Officer with Station Assignment

export interface StationOfficerDto {
  officerId: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
  postingDate: string;
  isActive: boolean;
  
  // Station Info
  stationId: number;
  stationName: string;
  stationCode: string;
  stationLocation?: string;
  
  // Performance
  totalChallans?: number;
  totalFirs?: number;
}

export interface CreateStationOfficerDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  stationId: number;
  isInvestigationOfficer: boolean;
  postingDate?: string;
}

export interface UpdateStationOfficerDto {
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
}

export interface TransferOfficerDto {
  officerId: number;
  fromStationId: number;
  toStationId: number;
  transferDate: string;
  reason?: string;
}

export interface OfficerSearchFilter {
  searchQuery?: string;
  stationIds?: number[];
  ranks?: string[];
  isInvestigationOfficer?: boolean;
  isActive?: boolean;
  minChallans?: number;
}