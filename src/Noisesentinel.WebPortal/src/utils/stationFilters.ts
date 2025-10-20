import { PoliceStationDto } from '@/models/Station';
import { PoliceOfficerDetailsDto } from '@/models/User';
import { ChallanDto } from '@/models/Challan';
import { FirDto } from '@/models/Fir';
import { DeviceDto } from '@/models/Device';
import { ViolationDto } from '@/models/Violation';

/**
 * Filter Helper Functions for Station Authority
 */
export const stationFilters = {
  /**
   * Filter stations by search query
   */
  filterStations(
    stations: PoliceStationDto[],
    searchQuery?: string,
    district?: string,
    province?: string
  ): PoliceStationDto[] {
    return stations.filter((station) => {
      const matchesSearch =
        !searchQuery ||
        station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.stationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (station.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesDistrict =
        !district || station.district?.toLowerCase() === district.toLowerCase();

      const matchesProvince =
        !province || station.province?.toLowerCase() === province.toLowerCase();

      return matchesSearch && matchesDistrict && matchesProvince;
    });
  },

  /**
   * Filter officers by multiple criteria
   */
  filterOfficers(
    officers: PoliceOfficerDetailsDto[],
    searchQuery?: string,
    stationIds?: number[],
    ranks?: string[],
    isInvestigationOfficer?: boolean,
    isActive?: boolean
  ): PoliceOfficerDetailsDto[] {
    return officers.filter((officer) => {
      const matchesSearch =
        !searchQuery ||
        officer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.cnic.includes(searchQuery);

      const matchesStation =
        !stationIds || stationIds.length === 0 || stationIds.includes(officer.stationId);

      const matchesRank = !ranks || ranks.length === 0 || ranks.includes(officer.rank);

      const matchesIO =
        isInvestigationOfficer === undefined ||
        officer.isInvestigationOfficer === isInvestigationOfficer;

      const matchesStatus = isActive === undefined || officer.isActive === isActive;

      return matchesSearch && matchesStation && matchesRank && matchesIO && matchesStatus;
    });
  },

  /**
   * Filter challans by multiple criteria
   */
  filterChallans(
    challans: ChallanDto[],
    searchQuery?: string,
    stationIds?: number[],
    statuses?: string[],
    isOverdue?: boolean,
    hasFir?: boolean,
    dateRange?: { start: string; end: string }
  ): ChallanDto[] {
    return challans.filter((challan) => {
      const matchesSearch =
        !searchQuery ||
        challan.accusedName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challan.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challan.challanId.toString().includes(searchQuery);

      const matchesStation =
        !stationIds || stationIds.length === 0 || stationIds.includes(challan.stationId || 0);

      const matchesStatus =
        !statuses || statuses.length === 0 || statuses.includes(challan.status);

      const matchesOverdue = isOverdue === undefined || (isOverdue && (challan.daysOverdue || 0) > 0);

      const matchesFir = hasFir === undefined || challan.hasFir === hasFir;

      const matchesDate =
        !dateRange ||
        (new Date(challan.issueDateTime) >= new Date(dateRange.start) &&
          new Date(challan.issueDateTime) <= new Date(dateRange.end));

      return (
        matchesSearch &&
        matchesStation &&
        matchesStatus &&
        matchesOverdue &&
        matchesFir &&
        matchesDate
      );
    });
  },

  /**
   * Filter FIRs by multiple criteria
   */
  filterFirs(
    firs: FirDto[],
    searchQuery?: string,
    stationIds?: number[],
    statuses?: string[],
    hasCase?: boolean,
    dateRange?: { start: string; end: string }
  ): FirDto[] {
    return firs.filter((fir) => {
      const matchesSearch =
        !searchQuery ||
        fir.firNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fir.accusedName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fir.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStation =
        !stationIds || stationIds.length === 0 || stationIds.includes(fir.stationId);

      const matchesStatus = !statuses || statuses.length === 0 || statuses.includes(fir.status);

      const matchesCase = hasCase === undefined || fir.hasCase === hasCase;

      const matchesDate =
        !dateRange ||
        (new Date(fir.filedDate) >= new Date(dateRange.start) &&
          new Date(fir.filedDate) <= new Date(dateRange.end));

      return matchesSearch && matchesStation && matchesStatus && matchesCase && matchesDate;
    });
  },

  /**
   * Filter devices
   */
  filterDevices(
    devices: DeviceDto[],
    searchQuery?: string,
    stationId?: number,
    calibrationStatus?: boolean,
    isPaired?: boolean
  ): DeviceDto[] {
    return devices.filter((device) => {
      const matchesSearch =
        !searchQuery ||
        device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.firmwareVersion.includes(searchQuery);

      const matchesStation = !stationId || device.stationId === stationId;

      const matchesCalibration =
        calibrationStatus === undefined || device.calibrationStatus === calibrationStatus;

      const matchesPaired = isPaired === undefined || device.isPaired === isPaired;

      return matchesSearch && matchesStation && matchesCalibration && matchesPaired;
    });
  },

  /**
   * Filter violations
   */
  filterViolations(
    violations: ViolationDto[],
    searchQuery?: string,
    isCognizable?: boolean,
    minPenalty?: number,
    maxPenalty?: number
  ): ViolationDto[] {
    return violations.filter((violation) => {
      const matchesSearch =
        !searchQuery ||
        violation.violationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        violation.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        violation.sectionOfLaw?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCognizable =
        isCognizable === undefined || violation.isCognizable === isCognizable;

      const matchesMinPenalty = !minPenalty || violation.penaltyAmount >= minPenalty;

      const matchesMaxPenalty = !maxPenalty || violation.penaltyAmount <= maxPenalty;

      return matchesSearch && matchesCognizable && matchesMinPenalty && matchesMaxPenalty;
    });
  },
};

/**
 * Date Helper Functions
 */
export const dateHelpers = {
  isDateInRange(date: string, start: string, end: string): boolean {
    const checkDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    return checkDate >= startDate && checkDate <= endDate;
  },

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
};