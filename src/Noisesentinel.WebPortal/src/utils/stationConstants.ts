/**
 * Station Authority Specific Constants
 */

export const STATION_ROUTES = {
  DASHBOARD: "/station/dashboard",

  // Stations
  STATIONS: "/station/stations",
  CREATE_STATION: "/station/stations/create",
  EDIT_STATION: "/station/stations/edit",
  STATION_DETAIL: "/station/stations/detail",

  // Officers
  OFFICERS: "/station/officers",
  CREATE_OFFICER: "/station/officers/create",
  EDIT_OFFICER: "/station/officers/edit",
  TRANSFER_OFFICER: "/station/officers/transfer",
  OFFICER_DETAIL: "/station/officers/detail",

  // Devices
  DEVICES: "/station/devices",
  REGISTER_DEVICE: "/station/devices/register",
  EDIT_DEVICE: "/station/devices/edit",

  // Violations
  VIOLATIONS: "/station/violations",
  CREATE_VIOLATION: "/station/violations/create",
  EDIT_VIOLATION: "/station/violations/edit",

  // Monitoring
  CHALLANS: "/station/challans",
  FIRS: "/station/firs",
  VEHICLES: "/station/vehicles",
  ACCUSED: "/station/accused",

  // Settings
  PROFILE: "/station/profile",
  CHANGE_PASSWORD: "/station/change-password",
};

export const OFFICER_RANKS = [
  "Constable",
  "Head Constable",
  "Assistant Sub-Inspector (ASI)",
  "Sub-Inspector (SI)",
  "Inspector",
  "Deputy Superintendent of Police (DSP)",
  "Superintendent of Police (SP)",
  "Senior Superintendent of Police (SSP)",
  "Deputy Inspector General (DIG)",
  "Inspector General (IG)",
];

export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
];

export const CHALLAN_STATUSES = [
  "Unpaid",
  "Paid",
  "Disputed",
  "Cancelled",
  "Overdue",
];

export const FIR_STATUSES = [
  "Filed",
  "Under Investigation",
  "Forwarded to Court",
  "Closed",
];
