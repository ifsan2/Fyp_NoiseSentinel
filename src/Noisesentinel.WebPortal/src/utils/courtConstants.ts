/**
 * Court Authority Specific Constants
 */

export const COURT_ROUTES = {
  DASHBOARD: "/court/dashboard",

  // Courts
  COURTS: "/court/courts",
  CREATE_COURT: "/court/courts/create",
  EDIT_COURT: "/court/courts/edit",
  COURT_DETAIL: "/court/courts/detail",

  // Judges
  JUDGES: "/court/judges",
  CREATE_JUDGE: "/court/judges/create",
  EDIT_JUDGE: "/court/judges/edit",
  JUDGE_DETAIL: "/court/judges/detail",

  // FIRs (Filed by Station Authority)
  FIRS: "/court/firs",
  FIR_DETAIL: "/court/firs/detail",

  // Cases
  CASES: "/court/cases",
  CREATE_CASE: "/court/cases/create",
  CASE_DETAIL: "/court/cases/detail",
  ASSIGN_JUDGE: "/court/cases/assign-judge",

  // Case Statements
  CASE_STATEMENTS: "/court/statements",
  STATEMENT_DETAIL: "/court/statements/detail",

  // Settings
  PROFILE: "/court/profile",
  CHANGE_PASSWORD: "/court/change-password",
};

export const JUDGE_RANKS = [
  "Civil Judge",
  "Senior Civil Judge",
  "District Judge",
  "Additional District Judge",
  "High Court Judge",
  "Chief Justice High Court",
  "Supreme Court Judge",
  "Chief Justice of Pakistan",
];

export const COURT_TYPES = [
  { id: 1, name: "Supreme Court" },
  { id: 2, name: "High Court" },
  { id: 3, name: "District Court" },
  { id: 4, name: "Civil Court" },
  { id: 5, name: "Sessions Court" },
];

export const CASE_STATUSES = [
  "Pending",
  "Under Review",
  "Hearing Scheduled",
  "Awaiting Verdict",
  "Convicted",
  "Acquitted",
  "Closed",
  "Dismissed",
  "Appealed",
];

export const CASE_TYPES = [
  "Traffic Violation - Noise Pollution",
  "Environmental Offense",
  "Public Nuisance",
  "Modified Vehicle",
  "Illegal Exhaust System",
  "Repeat Offense",
  "Other",
];

export const FIR_STATUSES = [
  "Filed",
  "Under Investigation",
  "Forwarded to Court",
  "Closed",
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
