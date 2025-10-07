using System;

namespace NoiseSentinel.BLL.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle response with full details.
/// </summary>
public class VehicleResponseDto
{
    public int VehicleId { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string? Make { get; set; }
    public string? Color { get; set; }
    public string? ChasisNo { get; set; }
    public string? EngineNo { get; set; }
    public DateTime? VehRegYear { get; set; }
    public int? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerCnic { get; set; }
    public string? OwnerContact { get; set; }
    public int TotalViolations { get; set; }
    public string RegistrationYear => VehRegYear.HasValue ? VehRegYear.Value.Year.ToString() : "N/A";
}