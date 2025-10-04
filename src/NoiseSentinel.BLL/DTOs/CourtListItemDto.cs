namespace NoiseSentinel.BLL.DTOs.Court;

/// <summary>
/// DTO for court list item (summary view).
/// </summary>
public class CourtListItemDto
{
    public int CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public string CourtTypeName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public int TotalJudges { get; set; }
}