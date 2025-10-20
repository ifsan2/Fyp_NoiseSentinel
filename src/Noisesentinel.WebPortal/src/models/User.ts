// User List Item (for tables)
export interface UserListItemDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  status: string;
}

// User Details
export interface UserDetailsDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  roleId?: number;
  roleName?: string;

  // Judge specific
  judgeId?: number;
  cnic?: string;
  contactNo?: string;
  rank?: string;
  courtId?: number;
  courtName?: string;
  courtLocation?: string;
  courtType?: string;

  // Officer specific
  officerId?: number;
  badgeNumber?: string;
  isInvestigationOfficer?: boolean;
  stationId?: number;
  stationName?: string;
  stationLocation?: string;
  stationCode?: string;
  postingDate?: string;
}

// Judge Details
export interface JudgeDetailsDto {
  judgeId: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  cnic: string;
  contactNo: string;
  rank: string;
  serviceStatus: boolean;
  isActive: boolean;
  courtId: number;
  courtName: string;
  courtLocation: string;
  courtType: string;
  totalCases: number;
  status: string;
}

// Police Officer Details
export interface PoliceOfficerDetailsDto {
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
  stationId: number;
  stationName: string;
  stationLocation: string;
  stationCode: string;
  totalChallans: number;
  status: string;
  investigationOfficerBadge: string;
}

// User Counts
export interface UserCountsDto {
  totalUsers: number;
  totalAdmins: number;
  totalCourtAuthorities: number;
  totalStationAuthorities: number;
  totalJudges: number;
  totalPoliceOfficers: number;
  activeUsers: number;
  inactiveUsers: number;
}

// Update User DTO
export interface UpdateUserDto {
  fullName: string;
  email: string;
  username: string;
}

// Update Judge DTO
export interface UpdateJudgeDto {
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  rank: string;
}

// Update Officer DTO
export interface UpdatePoliceOfficerDto {
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
}

// Search Filter
export interface UserSearchFilterDto {
  searchQuery?: string;
  role?: string;
  isActive?: boolean;
}

// Create Station Officer DTO
export interface CreateStationOfficerDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
  stationId: number;
}

// Update Station Officer DTO
export interface UpdateStationOfficerDto {
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
  stationId: number;
}
