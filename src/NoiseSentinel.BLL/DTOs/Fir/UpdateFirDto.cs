using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Fir;

/// <summary>
/// DTO for updating FIR status and investigation report.
/// </summary>
public class UpdateFirDto
{
    [Required(ErrorMessage = "FIR ID is required")]
    public int FirId { get; set; }

    [Required(ErrorMessage = "FIR status is required")]
    [StringLength(100, ErrorMessage = "Status cannot exceed 100 characters")]
    public string FirStatus { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Investigation report cannot exceed 500 characters")]
    public string? InvestigationReport { get; set; }
}