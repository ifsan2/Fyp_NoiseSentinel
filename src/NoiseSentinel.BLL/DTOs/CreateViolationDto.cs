using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Violation;

/// <summary>
/// DTO for creating a new violation type.
/// </summary>
public class CreateViolationDto
{
    [Required(ErrorMessage = "Violation type is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Violation type must be between 3 and 255 characters")]
    public string ViolationType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [StringLength(255, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 255 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Penalty amount is required")]
    [Range(0, 1000000, ErrorMessage = "Penalty amount must be between 0 and 1,000,000")]
    public decimal PenaltyAmount { get; set; }

    [StringLength(255, ErrorMessage = "Section of law cannot exceed 255 characters")]
    public string? SectionOfLaw { get; set; }

    [Required(ErrorMessage = "Cognizable status is required")]
    public bool IsCognizable { get; set; }
}