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
    public string? Color { get; set; }
    public string? OwnerName { get; set; }
    public int TotalViolations { get; set; }
}