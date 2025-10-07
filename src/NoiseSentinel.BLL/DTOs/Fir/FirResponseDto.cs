using System;

namespace NoiseSentinel.BLL.DTOs.Fir;

/// <summary>
/// DTO for FIR response with full details and evidence chain.
/// </summary>
public class FirResponseDto
{
    public int FirId { get; set; }
    public string FirNo { get; set; } = string.Empty;

    // Station Details
    public int StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string StationCode { get; set; } = string.Empty;

    // Challan Details (Evidence)
    public int ChallanId { get; set; }
    public string AccusedName { get; set; } = string.Empty;
    public string AccusedCnic { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public bool IsCognizable { get; set; }
    public decimal PenaltyAmount { get; set; }

    // Emission Report Evidence
    public int EmissionReportId { get; set; }
    public decimal SoundLevelDBa { get; set; }
    public string? MlClassification { get; set; }
    public string DigitalSignatureValue { get; set; } = string.Empty;

    // Informant (Police Officer)
    public int InformantId { get; set; }
    public string InformantName { get; set; } = string.Empty;
    public string InformantBadgeNumber { get; set; } = string.Empty;

    // FIR Specific
    public DateTime DateFiled { get; set; }
    public string FirDescription { get; set; } = string.Empty;
    public string FirStatus { get; set; } = string.Empty;
    public string? InvestigationReport { get; set; }

    // Computed Fields
    public string DateFiledFormatted => $"{DateFiled:yyyy-MM-dd HH:mm:ss} UTC";
    public int DaysSinceFiled => (DateTime.UtcNow - DateFiled).Days;
    public bool HasCase { get; set; }
    public int? CaseId { get; set; }
    public string EvidenceChain => $"FIR → Challan #{ChallanId} → EmissionReport #{EmissionReportId} (Digitally Signed)";
}