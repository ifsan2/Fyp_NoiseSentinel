using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for searching cases with multiple criteria
/// </summary>
public class CaseSearchDto
{
    /// <summary>
    /// Search by case number (partial match)
    /// </summary>
    public string? CaseNo { get; set; }

    /// <summary>
    /// Search by FIR number (partial match)
    /// </summary>
    public string? FirNo { get; set; }

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
    /// Search by case status
    /// </summary>
    public string? CaseStatus { get; set; }

    /// <summary>
    /// Search by case type
    /// </summary>
    public string? CaseType { get; set; }

    /// <summary>
    /// Search by judge ID
    /// </summary>
    public int? JudgeId { get; set; }

    /// <summary>
    /// Search by hearing date from
    /// </summary>
    public DateTime? HearingDateFrom { get; set; }

    /// <summary>
    /// Search by hearing date to
    /// </summary>
    public DateTime? HearingDateTo { get; set; }
}
