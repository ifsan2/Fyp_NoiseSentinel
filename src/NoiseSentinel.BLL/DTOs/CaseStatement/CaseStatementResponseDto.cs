using System;

namespace NoiseSentinel.BLL.DTOs.CaseStatement;

/// <summary>
/// DTO for case statement response with full details.
/// </summary>
public class CaseStatementResponseDto
{
    public int StatementId { get; set; }
    public int CaseId { get; set; }
    public string CaseNo { get; set; } = string.Empty;
    public string StatementBy { get; set; } = string.Empty;
    public string StatementText { get; set; } = string.Empty;
    public DateTime StatementDate { get; set; }

    // Case Details
    public string CaseType { get; set; } = string.Empty;
    public string CaseStatus { get; set; } = string.Empty;
    public string JudgeName { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;

    // Accused Details
    public string AccusedName { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;

    // Computed Fields
    public string StatementDateFormatted => $"{StatementDate:yyyy-MM-dd HH:mm:ss} UTC";
    public int DaysSinceStatement => (DateTime.UtcNow - StatementDate).Days;
}