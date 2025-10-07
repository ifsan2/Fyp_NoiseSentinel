using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle input during challan creation (auto-create if not exists).
/// </summary>
public class VehicleInputDto
{
    [Required(ErrorMessage = "Plate number is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Plate number must be between 3 and 50 characters")]
    [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "Plate number can only contain uppercase letters, numbers, and hyphens (e.g., PK-ABC-123)")]
    public string PlateNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Make/Model is required")]
    [StringLength(100, ErrorMessage = "Make/Model cannot exceed 100 characters")]
    public string Make { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Color cannot exceed 50 characters")]
    public string? Color { get; set; }

    [StringLength(100, ErrorMessage = "Chasis number cannot exceed 100 characters")]
    public string? ChasisNo { get; set; }

    [StringLength(100, ErrorMessage = "Engine number cannot exceed 100 characters")]
    public string? EngineNo { get; set; }

    public DateTime? VehRegYear { get; set; }
}