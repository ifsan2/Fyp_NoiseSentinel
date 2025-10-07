using System;

namespace NoiseSentinel.BLL.DTOs.EmissionReport;

/// <summary>
/// DTO for emission report response with full details.
/// </summary>
public class EmissionReportResponseDto
{
    public int EmissionReportId { get; set; }
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public decimal? Co { get; set; }
    public decimal? Co2 { get; set; }
    public decimal? Hc { get; set; }
    public decimal? Nox { get; set; }
    public decimal SoundLevelDBa { get; set; }
    public DateTime TestDateTime { get; set; }
    public string? MlClassification { get; set; }
    public string DigitalSignatureValue { get; set; } = string.Empty;
    public bool IsViolation { get; set; }
    public decimal LegalSoundLimit { get; set; } = 85.0m;
    public decimal? ExcessSound => IsViolation ? SoundLevelDBa - LegalSoundLimit : null;
    public bool HasChallan { get; set; }
    public int? ChallanId { get; set; }
    public string IntegrityStatus => "Verified - Digitally Signed";
    public string TestDateTimeFormatted => $"{TestDateTime:yyyy-MM-dd HH:mm:ss} UTC";
}