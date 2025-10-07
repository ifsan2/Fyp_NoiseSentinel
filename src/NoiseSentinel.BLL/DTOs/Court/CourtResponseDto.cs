using System.Collections.Generic;

namespace NoiseSentinel.BLL.DTOs.Court;

/// <summary>
/// DTO for court response with full details.
/// </summary>
public class CourtResponseDto
{
    public int CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public int CourtTypeId { get; set; }
    public string CourtTypeName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public int TotalJudges { get; set; }
    public List<JudgeSummaryDto> Judges { get; set; } = new();
}

/// <summary>
/// Summary information about a judge (for court response).
/// </summary>
public class JudgeSummaryDto
{
    public int JudgeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Rank { get; set; }
    public bool ServiceStatus { get; set; }
}