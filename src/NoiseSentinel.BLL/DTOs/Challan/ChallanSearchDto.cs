namespace NoiseSentinel.BLL.DTOs.Challan;

/// <summary>
/// DTO for advanced challan search with multiple criteria
/// </summary>
public class ChallanSearchDto
{
    /// <summary>
    /// Search by vehicle plate number
    /// </summary>
    public string? VehiclePlateNumber { get; set; }

    /// <summary>
    /// Search by accused CNIC
    /// </summary>
    public string? AccusedCnic { get; set; }

    /// <summary>
    /// Search by accused name (partial match)
    /// </summary>
    public string? AccusedName { get; set; }

    /// <summary>
    /// Search by vehicle make (partial match)
    /// </summary>
    public string? VehicleMake { get; set; }

    /// <summary>
    /// Search by vehicle model year
    /// </summary>
    public int? VehicleMakeYear { get; set; }

    /// <summary>
    /// Search by challan status
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Search by violation type
    /// </summary>
    public string? ViolationType { get; set; }

    /// <summary>
    /// Search by station ID
    /// </summary>
    public int? StationId { get; set; }

    /// <summary>
    /// Search by officer ID
    /// </summary>
    public int? OfficerId { get; set; }

    /// <summary>
    /// Search by issue date from
    /// </summary>
    public DateTime? IssueDateFrom { get; set; }

    /// <summary>
    /// Search by issue date to
    /// </summary>
    public DateTime? IssueDateTo { get; set; }
}
