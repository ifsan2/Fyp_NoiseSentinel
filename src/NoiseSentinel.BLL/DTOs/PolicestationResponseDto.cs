using System.Collections.Generic;

namespace NoiseSentinel.BLL.DTOs.Policestation;

/// <summary>
/// DTO for police station response with full details.
/// </summary>
public class PolicestationResponseDto
{
    public int StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string StationCode { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string? Contact { get; set; }
    public int TotalOfficers { get; set; }
    public List<OfficerSummaryDto> Officers { get; set; } = new();
}

/// <summary>
/// Summary information about a police officer (for station response).
/// </summary>
public class OfficerSummaryDto
{
    public int OfficerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string BadgeNumber { get; set; } = string.Empty;
    public string? Rank { get; set; }
    public bool IsInvestigationOfficer { get; set; }
}