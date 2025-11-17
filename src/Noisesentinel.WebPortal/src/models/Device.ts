// IoT Device DTOs

export interface DeviceDto {
  deviceId: number;
  deviceName: string;
  firmwareVersion: string;
  calibrationDate: string | null;
  calibrationStatus: boolean;
  calibrationCertificateNo?: string;
  isActive: boolean;
  isPaired: boolean;
  pairedOfficerId?: number;
  pairedOfficerName?: string;
  pairingDateTime?: string;
}

export interface CreateDeviceDto {
  deviceName: string;
  firmwareVersion: string;
  calibrationDate: string;
  calibrationStatus: boolean;
  calibrationCertificateNo?: string;
}

export interface UpdateDeviceDto {
  deviceId: number;
  deviceName: string;
  firmwareVersion: string;
  calibrationDate: string;
  calibrationStatus: boolean;
  calibrationCertificateNo?: string;
}

export interface DeviceSearchFilter {
  searchQuery?: string;
  stationId?: number;
  calibrationStatus?: boolean;
  isPaired?: boolean;
  isActive?: boolean;
}
