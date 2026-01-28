/**
 * Helper utilities to determine challan type without database changes.
 * Uses hybrid approach: EmissionReportId presence + ViolationType analysis.
 */

// Challan type constants
export const CHALLAN_TYPE = {
  TRAFFIC: "Traffic",
  NON_TRAFFIC: "Non-Traffic",
} as const;

export type ChallanType = (typeof CHALLAN_TYPE)[keyof typeof CHALLAN_TYPE];

// Keywords that indicate non-traffic violations (noise/emission related)
const NON_TRAFFIC_KEYWORDS = [
  "noise",
  "emission",
  "sound",
  "silencer",
  "pollution",
  "exhaust",
  "decibel",
  "dba",
  "modified",
  "loud",
  "co2",
  "carbon",
  "smoke",
  "environmental",
];

/**
 * Determines challan type based on emission report presence and violation type.
 */
export const getChallanType = (
  violationType?: string | null,
  emissionReportId?: number | null,
): ChallanType => {
  // If has emission report, it's definitely non-traffic (noise/emission)
  if (emissionReportId) {
    return CHALLAN_TYPE.NON_TRAFFIC;
  }

  // If no violation type specified, default to traffic
  if (!violationType) {
    return CHALLAN_TYPE.TRAFFIC;
  }

  // Check if violation type contains non-traffic keywords
  const lowerViolationType = violationType.toLowerCase();
  const isNonTraffic = NON_TRAFFIC_KEYWORDS.some((keyword) =>
    lowerViolationType.includes(keyword),
  );

  return isNonTraffic ? CHALLAN_TYPE.NON_TRAFFIC : CHALLAN_TYPE.TRAFFIC;
};

/**
 * Determines violation category from violation type name.
 */
export const getViolationCategory = (
  violationType?: string | null,
): ChallanType => {
  if (!violationType) {
    return CHALLAN_TYPE.TRAFFIC;
  }

  const lowerViolationType = violationType.toLowerCase();
  const isNonTraffic = NON_TRAFFIC_KEYWORDS.some((keyword) =>
    lowerViolationType.includes(keyword),
  );

  return isNonTraffic ? CHALLAN_TYPE.NON_TRAFFIC : CHALLAN_TYPE.TRAFFIC;
};

/**
 * Validates if emission report is required for a violation type.
 * Non-traffic violations should ideally have emission reports.
 */
export const isEmissionReportRecommended = (
  violationType?: string | null,
): boolean => {
  return getViolationCategory(violationType) === CHALLAN_TYPE.NON_TRAFFIC;
};

/**
 * Gets color for challan type badge.
 */
export const getChallanTypeColor = (type: ChallanType): string => {
  return type === CHALLAN_TYPE.NON_TRAFFIC ? "#8B5CF6" : "#3B82F6";
};

/**
 * Gets background color for challan type badge.
 */
export const getChallanTypeBgColor = (type: ChallanType): string => {
  return type === CHALLAN_TYPE.NON_TRAFFIC ? "#EDE9FE" : "#DBEAFE";
};
