namespace NoiseSentinel.BLL.DTOs.EmissionReport;

/// <summary>
/// DTO for emission report integrity verification result.
/// </summary>
public class VerifyEmissionReportDto
{
    public int EmissionReportId { get; set; }
    public bool IsAuthentic { get; set; }
    public bool DigitalSignatureMatch { get; set; }
    public string DataIntegrity { get; set; } = string.Empty;
    public string StoredSignature { get; set; } = string.Empty;
    public string ComputedSignature { get; set; } = string.Empty;
    public DateTime VerifiedAt { get; set; }
    public bool AdmissibleInCourt { get; set; }
    public string VerificationMessage { get; set; } = string.Empty;
}