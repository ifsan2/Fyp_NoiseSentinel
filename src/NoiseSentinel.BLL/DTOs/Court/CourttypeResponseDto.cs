namespace NoiseSentinel.BLL.DTOs.Court;

/// <summary>
/// DTO for court type response.
/// </summary>
public class CourttypeResponseDto
{
    public int CourtTypeId { get; set; }
    public string CourtTypeName { get; set; } = string.Empty;
}