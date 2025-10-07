using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for updating case details.
/// </summary>
public class UpdateCaseDto
{
    [Required(ErrorMessage = "Case ID is required")]
    public int CaseId { get; set; }

    [StringLength(100, ErrorMessage = "Case status cannot exceed 100 characters")]
    public string? CaseStatus { get; set; }

    public DateTime? HearingDate { get; set; }

    [StringLength(255, ErrorMessage = "Verdict cannot exceed 255 characters")]
    public string? Verdict { get; set; }
}