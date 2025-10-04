using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Policestation;

/// <summary>
/// DTO for creating a new police station.
/// </summary>
public class CreatePolicestationDto
{
    [Required(ErrorMessage = "Station name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Station name must be between 3 and 255 characters")]
    public string StationName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Station code is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Station code must be between 3 and 50 characters")]
    [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "Station code can only contain uppercase letters, numbers, and hyphens")]
    public string StationCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Location is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Location must be between 3 and 255 characters")]
    public string Location { get; set; } = string.Empty;

    [Required(ErrorMessage = "District is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "District must be between 3 and 255 characters")]
    public string District { get; set; } = string.Empty;

    [Required(ErrorMessage = "Province is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Province must be between 3 and 255 characters")]
    public string Province { get; set; } = string.Empty;

    [StringLength(50, MinimumLength = 10, ErrorMessage = "Contact number must be between 10 and 50 characters")]
    [RegularExpression(@"^[\d\s\-\+\(\)]+$", ErrorMessage = "Invalid contact number format")]
    public string? Contact { get; set; }
}