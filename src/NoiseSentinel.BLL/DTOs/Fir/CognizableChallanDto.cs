using System;

namespace NoiseSentinel.BLL.DTOs.Fir;

/// <summary>
/// DTO for challans eligible for FIR filing (cognizable violations without FIR).
/// </summary>
public class CognizableChallanDto
{
    public int ChallanId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public string AccusedName { get; set; } = string.Empty;
    public string AccusedCnic { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public DateTime IssueDateTime { get; set; }
    public decimal SoundLevelDBa { get; set; }
    public string? MlClassification { get; set; }
    public bool HasFir { get; set; }
    public string Recommendation => "Eligible for FIR - Cognizable Offense";
}