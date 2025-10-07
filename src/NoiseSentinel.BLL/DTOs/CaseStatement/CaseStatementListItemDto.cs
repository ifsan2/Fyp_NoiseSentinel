using System;

namespace NoiseSentinel.BLL.DTOs.CaseStatement;

/// <summary>
/// DTO for case statement list item (summary view).
/// </summary>
public class CaseStatementListItemDto
{
    public int StatementId { get; set; }
    public int CaseId { get; set; }
    public string CaseNo { get; set; } = string.Empty;
    public string StatementBy { get; set; } = string.Empty;
    public DateTime StatementDate { get; set; }
    public string JudgeName { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public string StatementPreview { get; set; } = string.Empty; // First 100 characters
}