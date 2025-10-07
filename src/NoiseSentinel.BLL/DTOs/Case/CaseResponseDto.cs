using System;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for case response with full details and evidence chain.
/// </summary>
public class CaseResponseDto
{
    public int CaseId { get; set; }
    public string CaseNo { get; set; } = string.Empty;
    public string CaseType { get; set; } = string.Empty;
    public string CaseStatus { get; set; } = string.Empty;
    public DateTime? HearingDate { get; set; }
    public string? Verdict { get; set; }

    // Judge Details
    public int JudgeId { get; set; }
    public string JudgeName { get; set; } = string.Empty;
    public string JudgeDesignation { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public string CourtType { get; set; } = string.Empty;

    // FIR Details (Evidence)
    public int FirId { get; set; }
    public string FirNo { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public DateTime FirDateFiled { get; set; }

    // Challan Details (Evidence)
    public int ChallanId { get; set; }
    public string AccusedName { get; set; } = string.Empty;
    public string AccusedCnic { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }

    // Emission Report Evidence
    public int EmissionReportId { get; set; }
    public decimal SoundLevelDBa { get; set; }
    public string? MlClassification { get; set; }
    public string DigitalSignatureValue { get; set; } = string.Empty;

    // Computed Fields
    public string HearingDateFormatted => HearingDate.HasValue
        ? $"{HearingDate.Value:yyyy-MM-dd HH:mm:ss} UTC"
        : "Not Scheduled";
    public int? DaysUntilHearing => HearingDate.HasValue
        ? (HearingDate.Value - DateTime.UtcNow).Days
        : null;
    public bool HasCaseStatement { get; set; }
    public int CaseStatementCount { get; set; }
    public string EvidenceChain => $"Case → FIR #{FirId} → Challan #{ChallanId} → EmissionReport #{EmissionReportId} (Digitally Signed)";
}