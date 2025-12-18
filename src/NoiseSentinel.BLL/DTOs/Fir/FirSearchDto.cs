namespace NoiseSentinel.BLL.DTOs.Fir;

/// <summary>
/// DTO for searching FIRs with multiple criteria
/// </summary>
public class FirSearchDto
{
    /// <summary>
    /// Search by FIR number (partial match)
    /// </summary>
    public string? FirNo { get; set; }

    /// <summary>
    /// Search by challan ID
    /// </summary>
    public int? ChallanId { get; set; }

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
    /// Search by FIR status
    /// </summary>
    public string? FirStatus { get; set; }

    /// <summary>
    /// Search by station ID
    /// </summary>
    public int? StationId { get; set; }

    /// <summary>
    /// Search by date filed from
    /// </summary>
    public DateTime? DateFiledFrom { get; set; }

    /// <summary>
    /// Search by date filed to
    /// </summary>
    public DateTime? DateFiledTo { get; set; }

    /// <summary>
    /// Filter FIRs that have/don't have cases
    /// </summary>
    public bool? HasCase { get; set; }
}
