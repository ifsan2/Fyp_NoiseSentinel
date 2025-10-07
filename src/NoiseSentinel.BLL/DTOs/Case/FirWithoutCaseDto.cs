using System;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for FIRs without cases yet (eligible for case creation).
/// </summary>
public class FirWithoutCaseDto
{
    public int FirId { get; set; }
    public string FirNo { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public string AccusedName { get; set; } = string.Empty;
    public string AccusedCnic { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public DateTime FirDateFiled { get; set; }
    public string FirStatus { get; set; } = string.Empty;
    public bool HasCase { get; set; }
    public string Recommendation => "Eligible for Case Creation";
}