namespace NoiseSentinel.BLL.DTOs.Accused;

/// <summary>
/// DTO for accused list item (summary view).
/// </summary>
public class AccusedListItemDto
{
    public int AccusedId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Contact { get; set; }
    public int TotalViolations { get; set; }
    public int TotalVehicles { get; set; }
}