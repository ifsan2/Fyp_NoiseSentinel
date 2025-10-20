export interface IotDeviceListItemDto {
  deviceId: number;
  deviceName: string;
  firmwareVersion?: string;
  isCalibrated: boolean;
  isRegistered: boolean;
  pairingDateTime?: string;
  totalEmissionReports: number;
  status: string;
  isAvailable: boolean;
}

export interface IotDeviceResponseDto {
  deviceId: number;
  deviceName: string;
  firmwareVersion?: string;
  isCalibrated: boolean;
  isRegistered: boolean;
  pairingDateTime?: string;
  totalEmissionReports: number;
  status: string;
  calibrationStatus: string;
  registrationStatus: string;
  availabilityStatus: string;
  lastPaired: string;
}

export interface PairIotDeviceDto {
  deviceId: number;
}