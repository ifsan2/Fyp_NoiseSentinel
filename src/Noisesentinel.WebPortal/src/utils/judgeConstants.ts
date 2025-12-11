/**
 * Judge Authority Specific Constants
 */

export const JUDGE_ROUTES = {
  DASHBOARD: "/judge/dashboard",

  // Cases (Judge's assigned cases)
  MY_CASES: "/judge/my-cases",
  CREATE_CASE: "/judge/cases/create",
  CASE_DETAIL: "/judge/cases/detail",
  UPDATE_CASE: "/judge/cases/update",

  // Case Statements (Judge's statements)
  CASE_STATEMENTS: "/judge/statements",
  CREATE_STATEMENT: "/judge/statements/create",
  EDIT_STATEMENT: "/judge/statements/update",
  STATEMENT_DETAIL: "/judge/statements/detail",

  // Settings
  PROFILE: "/judge/profile",
  CHANGE_PASSWORD: "/judge/change-password",
};

export const CASE_STATUSES = [
  "Pending",
  "Under Review",
  "Hearing Scheduled",
  "Awaiting Verdict",
  "Verdict Given",
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

export const VERDICT_OPTIONS = [
  "Guilty - Fine Imposed",
  "Guilty - Warning Issued",
  "Not Guilty - Case Dismissed",
  "Case Withdrawn",
  "Settlement Reached",
  "Referred to Higher Court",
];

export const STATEMENT_TYPES = [
  "Hearing Proceeding",
  "Interim Order",
  "Observation",
  "Final Verdict",
  "Case Summary",
  "Evidence Review",
];

export const HEARING_STATUS = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Adjourned",
  "Postponed",
  "Cancelled",
];
