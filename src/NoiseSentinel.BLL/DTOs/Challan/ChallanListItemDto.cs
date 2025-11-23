using System;

namespace NoiseSentinel.BLL.DTOs.Challan;

/// <summary>
/// DTO for challan list item (summary view).
/// </summary>
public class ChallanListItemDto
{
    public int ChallanId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public string? OfficerBadgeNumber { get; set; }
    public string? OfficerRank { get; set; }
    public string AccusedName { get; set; } = string.Empty;
    public string AccusedCnic { get; set; } = string.Empty;
    public string? AccusedContact { get; set; }
    public string? AccusedAddress { get; set; }
    public string? AccusedCity { get; set; }
    public string? AccusedProvince { get; set; }
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleColor { get; set; }
    public DateTime? VehicleMakeYear { get; set; }
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public DateTime IssueDateTime { get; set; }
    public DateTime DueDateTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string? EvidencePath { get; set; }
    public bool IsOverdue { get; set; }
    public bool HasFir { get; set; }
    
    // Emission Report fields
    public int? EmissionReportId { get; set; }
    public string? DeviceName { get; set; }
    public decimal? SoundLevelDBa { get; set; }
    public string? MlClassification { get; set; }
    public DateTime? EmissionTestDateTime { get; set; }
    
    // Additional fields
    public bool IsCognizable { get; set; }
    public int? OfficerId { get; set; }
}