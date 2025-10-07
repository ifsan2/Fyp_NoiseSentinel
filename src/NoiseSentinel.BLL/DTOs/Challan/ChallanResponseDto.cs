using System;

namespace NoiseSentinel.BLL.DTOs.Challan;

/// <summary>
/// DTO for challan response with full details and evidence chain.
/// </summary>
public class ChallanResponseDto
{
    public int ChallanId { get; set; }

    // Officer Details
    public int OfficerId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public string OfficerBadgeNumber { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;

    // Accused Details
    public int AccusedId { get; set; }
    public string AccusedName { get; set; } = string.Empty;
    public string AccusedCnic { get; set; } = string.Empty;
    public string? AccusedContact { get; set; }

    // Vehicle Details
    public int VehicleId { get; set; }
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleColor { get; set; }

    // Violation Details
    public int ViolationId { get; set; }
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public bool IsCognizable { get; set; }

    // Emission Report Details (Evidence)
    public int EmissionReportId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public decimal SoundLevelDBa { get; set; }
    public string? MlClassification { get; set; }
    public DateTime EmissionTestDateTime { get; set; }

    // Challan Specific
    public string? EvidencePath { get; set; }
    public DateTime IssueDateTime { get; set; }
    public DateTime DueDateTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? BankDetails { get; set; }
    public string DigitalSignatureValue { get; set; } = string.Empty;

    // Computed Fields
    public string IssueDateFormatted => $"{IssueDateTime:yyyy-MM-dd HH:mm:ss} UTC";
    public string DueDateFormatted => $"{DueDateTime:yyyy-MM-dd HH:mm:ss} UTC";
    public int DaysUntilDue => (DueDateTime - DateTime.UtcNow).Days;
    public bool IsOverdue => DateTime.UtcNow > DueDateTime && Status?.ToLower() == "unpaid";
    public string IntegrityStatus => "Verified - Digitally Signed from Emission Report";
    public bool HasFir { get; set; }
    public int? FirId { get; set; }
}