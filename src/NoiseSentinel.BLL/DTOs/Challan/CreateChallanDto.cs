using NoiseSentinel.BLL.DTOs.Accused;
using NoiseSentinel.BLL.DTOs.Vehicle;
using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Challan;

/// <summary>
/// DTO for creating a new challan.
/// COMPLEX: Supports auto-creation of Vehicle and Accused if they don't exist.
/// </summary>
public class CreateChallanDto
{
    [Required(ErrorMessage = "Violation ID is required")]
    public int ViolationId { get; set; }

    [Required(ErrorMessage = "Emission Report ID is required")]
    public int EmissionReportId { get; set; }

    // ========================================================================
    // VEHICLE: Either provide ID OR full details for auto-creation
    // ========================================================================

    /// <summary>
    /// Existing vehicle ID (if vehicle already registered).
    /// If null, VehicleInput must be provided.
    /// </summary>
    public int? VehicleId { get; set; }

    /// <summary>
    /// Vehicle details for auto-creation (if VehicleId is null).
    /// </summary>
    public VehicleInputDto? VehicleInput { get; set; }

    // ========================================================================
    // ACCUSED: Either provide ID OR full details for auto-creation
    // ========================================================================

    /// <summary>
    /// Existing accused ID (if person already registered).
    /// If null, AccusedInput must be provided.
    /// </summary>
    public int? AccusedId { get; set; }

    /// <summary>
    /// Accused details for auto-creation (if AccusedId is null).
    /// </summary>
    public AccusedInputDto? AccusedInput { get; set; }

    // ========================================================================
    // CHALLAN SPECIFIC FIELDS
    // ========================================================================

    [StringLength(255, ErrorMessage = "Evidence path cannot exceed 255 characters")]
    public string? EvidencePath { get; set; }

    [StringLength(255, ErrorMessage = "Bank details cannot exceed 255 characters")]
    public string? BankDetails { get; set; }
}