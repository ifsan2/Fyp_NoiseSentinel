// Police Station DTOs

export interface PoliceStationDto {
  stationId: number;
  stationName: string;
  stationCode: string;
  location?: string;
  district?: string;
  province?: string;
  contact?: string;
}

export interface CreatePoliceStationDto {
  stationName: string;
  stationCode: string;
  location?: string;
  district?: string;
  province?: string;
  contact?: string;
}

export interface UpdatePoliceStationDto {
  stationId: number;
  stationName: string;
  stationCode: string;
  location?: string;
  district?: string;
  province?: string;
  contact?: string;
}

export interface StationStatistics {
  stationId: number;
  stationName: string;
  stationCode: string;
  location?: string;
  district?: string;
  province?: string;
  
  // Officer Stats
  totalOfficers: number;
  activeOfficers: number;
  investigationOfficers: number;
  
  // Device Stats
  totalDevices: number;
  devicesInUse: number;
  availableDevices: number;
  
  // Performance
  totalChallans: number;
  thisMonthChallans: number;
  totalFirs: number;
  thisMonthFirs: number;
  
  // Rankings
  performanceRank?: number;
  performanceScore?: number;
}

export interface StationSearchFilter {
  searchQuery?: string;
  district?: string;
  province?: string;
  minOfficers?: number;
  maxOfficers?: number;
}