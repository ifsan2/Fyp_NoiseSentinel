using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for creating a new case.
/// </summary>
public class CreateCaseDto
{
    [Required(ErrorMessage = "FIR ID is required")]
    public int FirId { get; set; }

    [Required(ErrorMessage = "Judge ID is required")]
    public int JudgeId { get; set; }

    [StringLength(255, ErrorMessage = "Case type cannot exceed 255 characters")]
    public string? CaseType { get; set; } = "Traffic Violation";

    public DateTime? HearingDate { get; set; }
}