using System;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for case list item (summary view).
/// </summary>
public class CaseListItemDto
{
    public int CaseId { get; set; }
    public string CaseNo { get; set; } = string.Empty;
    public string CaseType { get; set; } = string.Empty;
    public string CaseStatus { get; set; } = string.Empty;
    public string JudgeName { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public string AccusedName { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public DateTime? HearingDate { get; set; }
    public string? Verdict { get; set; }
    public bool HasCaseStatement { get; set; }
}