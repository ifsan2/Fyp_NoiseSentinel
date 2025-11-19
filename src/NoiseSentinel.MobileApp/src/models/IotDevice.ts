export interface IotDeviceListItemDto {
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

export interface IotDeviceResponseDto {
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

export interface PairIotDeviceDto {
  deviceId: number;
}
