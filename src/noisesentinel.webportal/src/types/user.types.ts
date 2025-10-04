export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Judge {
  judgeId: number;
  userId: number;
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  rank: string;
  courtId: number;
  courtName?: string;
  serviceStatus: boolean;
}

export interface PoliceOfficer {
  officerId: number;
  userId: number;
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  badgeNumber: string;
  rank: string;
  isInvestigationOfficer: boolean;
  stationId: number;
  stationName?: string;
  postingDate: string;
}

export interface Court {
  courtId: number;
  courtName: string;
  courtTypeId: number;
  location: string;
  district: string;
  province: string;
}

export interface PoliceStation {
  stationId: number;
  stationName: string;
  stationCode: string;
  address: string;
  district: string;
  province: string;
  contactNo: string;
}