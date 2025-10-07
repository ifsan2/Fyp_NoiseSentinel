namespace NoiseSentinel.BLL.DTOs.Policestation;

/// <summary>
/// DTO for police station list item (summary view).
/// </summary>
public class PolicestationListItemDto
{
    public int StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string StationCode { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string? Contact { get; set; }
    public int TotalOfficers { get; set; }
}