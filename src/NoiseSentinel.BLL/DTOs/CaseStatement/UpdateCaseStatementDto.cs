using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.CaseStatement;

/// <summary>
/// DTO for updating an existing case statement.
/// </summary>
public class UpdateCaseStatementDto
{
    [Required(ErrorMessage = "Statement ID is required")]
    public int StatementId { get; set; }

    [Required(ErrorMessage = "Statement text is required")]
    [StringLength(5000, MinimumLength = 20, ErrorMessage = "Statement text must be between 20 and 5000 characters")]
    public string StatementText { get; set; } = string.Empty;
}