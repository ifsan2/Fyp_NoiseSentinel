using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.CaseStatement;

/// <summary>
/// DTO for creating a new case statement.
/// </summary>
public class CreateCaseStatementDto
{
    [Required(ErrorMessage = "Case ID is required")]
    public int CaseId { get; set; }

    [Required(ErrorMessage = "Statement text is required")]
    [StringLength(5000, MinimumLength = 20, ErrorMessage = "Statement text must be between 20 and 5000 characters")]
    public string StatementText { get; set; } = string.Empty;

    [StringLength(255, ErrorMessage = "Statement by cannot exceed 255 characters")]
    public string? StatementBy { get; set; }
}