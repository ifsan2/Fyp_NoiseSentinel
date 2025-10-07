namespace NoiseSentinel.BLL.DTOs.Violation;

/// <summary>
/// DTO for violation response with full details.
/// </summary>
public class ViolationResponseDto
{
    public int ViolationId { get; set; }
    public string ViolationType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public string? SectionOfLaw { get; set; }
    public bool IsCognizable { get; set; }
    public int TotalChallans { get; set; }
    public string CognizableStatus => IsCognizable ? "Yes - FIR can be filed" : "No - Challan only";
}