using System;

namespace NoiseSentinel.BLL.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle list item (summary view).
/// </summary>
public class VehicleListItemDto
{
    public int VehicleId { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string? Make { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public int? RegistrationYear { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerCnic { get; set; }
    public string? OwnerContact { get; set; }
    public int TotalChallans { get; set; }
    public decimal TotalPenalties { get; set; }
}