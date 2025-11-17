namespace NoiseSentinel.BLL.DTOs.Violation;

/// <summary>
/// DTO for violation list item (summary view).
/// </summary>
public class ViolationListItemDto
{
    public int ViolationId { get; set; }
    public string ViolationType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public string? SectionOfLaw { get; set; }
    public bool IsCognizable { get; set; }
    public int TotalChallans { get; set; }
}