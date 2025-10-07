using System;

namespace NoiseSentinel.BLL.DTOs.EmissionReport;

/// <summary>
/// DTO for emission report list item (summary view).
/// </summary>
public class EmissionReportListItemDto
{
    public int EmissionReportId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public decimal SoundLevelDBa { get; set; }
    public DateTime TestDateTime { get; set; }
    public string? MlClassification { get; set; }
    public bool IsViolation { get; set; }
    public bool HasChallan { get; set; }
    public string Status => HasChallan ? "Challan Issued" : "Pending Action";
}