using System.Collections.Generic;

namespace NoiseSentinel.BLL.DTOs.Accused;

/// <summary>
/// DTO for accused response with full details.
/// </summary>
public class AccusedResponseDto
{
    public int AccusedId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Address { get; set; }
    public string? Contact { get; set; }
    public int TotalViolations { get; set; }
    public int TotalVehicles { get; set; }
    public List<AccusedVehicleSummaryDto> Vehicles { get; set; } = new();
}

/// <summary>
/// Summary information about a vehicle (for accused response).
/// </summary>
public class AccusedVehicleSummaryDto
{
    public int VehicleId { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string? Make { get; set; }
    public string? Color { get; set; }
}