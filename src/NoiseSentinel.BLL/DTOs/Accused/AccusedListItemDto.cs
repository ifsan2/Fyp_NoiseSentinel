namespace NoiseSentinel.BLL.DTOs.Accused;

/// <summary>
/// DTO for accused list item (summary view).
/// </summary>
public class AccusedListItemDto
{
    public int AccusedId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string? ContactNo { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public int TotalChallans { get; set; }
    public decimal TotalPenalties { get; set; }
    public bool HasPendingChallans { get; set; }
}