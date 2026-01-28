using System.Linq;

namespace NoiseSentinel.BLL.Helpers;

/// <summary>
/// Helper class to determine challan type without database changes.
/// Uses hybrid approach: EmissionReportId presence + ViolationType analysis.
/// </summary>
public static class ChallanTypeHelper
{
    // Challan type constants
    public const string TRAFFIC = "Traffic";
    public const string NON_TRAFFIC = "Non-Traffic";

    // Keywords that indicate non-traffic violations (noise/emission related)
    private static readonly string[] NonTrafficKeywords = new[]
    {
        "noise", "emission", "sound", "silencer", "pollution",
        "exhaust", "decibel", "dba", "modified", "loud",
        "co2", "carbon", "smoke", "environmental"
    };

    /// <summary>
    /// Determines challan type based on emission report presence and violation type.
    /// </summary>
    /// <param name="violationType">Type of violation</param>
    /// <param name="hasEmissionReport">Whether challan has an emission report</param>
    /// <returns>"Traffic" or "Non-Traffic"</returns>
    public static string GetChallanType(string? violationType, bool hasEmissionReport)
    {
        // If has emission report, it's definitely non-traffic (noise/emission)
        if (hasEmissionReport)
            return NON_TRAFFIC;

        // If no violation type specified, default to traffic
        if (string.IsNullOrWhiteSpace(violationType))
            return TRAFFIC;

        // Check if violation type contains non-traffic keywords
        var lowerViolationType = violationType.ToLower();
        var isNonTraffic = NonTrafficKeywords.Any(keyword => lowerViolationType.Contains(keyword));

        return isNonTraffic ? NON_TRAFFIC : TRAFFIC;
    }

    /// <summary>
    /// Determines violation category from violation type name.
    /// </summary>
    /// <param name="violationType">Type of violation</param>
    /// <returns>"Traffic" or "Non-Traffic"</returns>
    public static string GetViolationCategory(string? violationType)
    {
        if (string.IsNullOrWhiteSpace(violationType))
            return TRAFFIC;

        var lowerViolationType = violationType.ToLower();
        var isNonTraffic = NonTrafficKeywords.Any(keyword => lowerViolationType.Contains(keyword));

        return isNonTraffic ? NON_TRAFFIC : TRAFFIC;
    }

    /// <summary>
    /// Validates if emission report is required for a violation type.
    /// Non-traffic violations should ideally have emission reports.
    /// </summary>
    /// <param name="violationType">Type of violation</param>
    /// <returns>True if emission report is recommended</returns>
    public static bool IsEmissionReportRecommended(string? violationType)
    {
        return GetViolationCategory(violationType) == NON_TRAFFIC;
    }
}
