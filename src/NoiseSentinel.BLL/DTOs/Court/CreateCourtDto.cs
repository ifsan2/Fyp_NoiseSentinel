using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Court;

/// <summary>
/// DTO for creating a new court.
/// </summary>
public class CreateCourtDto
{
    [Required(ErrorMessage = "Court name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Court name must be between 3 and 255 characters")]
    public string CourtName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Court type is required")]
    public int CourtTypeId { get; set; }

    [Required(ErrorMessage = "Location is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Location must be between 3 and 255 characters")]
    public string Location { get; set; } = string.Empty;

    [Required(ErrorMessage = "District is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "District must be between 3 and 255 characters")]
    public string District { get; set; } = string.Empty;

    [Required(ErrorMessage = "Province is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Province must be between 3 and 255 characters")]
    public string Province { get; set; } = string.Empty;
}