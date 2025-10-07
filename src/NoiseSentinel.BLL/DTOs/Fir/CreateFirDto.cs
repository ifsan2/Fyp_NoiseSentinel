using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Fir;

/// <summary>
/// DTO for creating a new FIR (First Information Report).
/// </summary>
public class CreateFirDto
{
    [Required(ErrorMessage = "Challan ID is required")]
    public int ChallanId { get; set; }

    [Required(ErrorMessage = "FIR description is required")]
    [StringLength(500, MinimumLength = 20, ErrorMessage = "FIR description must be between 20 and 500 characters")]
    public string FirDescription { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Investigation report cannot exceed 500 characters")]
    public string? InvestigationReport { get; set; }
}