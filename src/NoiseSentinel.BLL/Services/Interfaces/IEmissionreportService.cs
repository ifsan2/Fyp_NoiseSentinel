using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.EmissionReport;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Emission Report management operations.
/// </summary>
public interface IEmissionreportService
{
    /// <summary>
    /// Create a new emission report from IoT device (Police Officer only).
    /// Generates digital signature for integrity protection.
    /// </summary>
    Task<ServiceResult<EmissionReportResponseDto>> CreateEmissionReportAsync(
        CreateEmissionReportDto dto, int officerUserId);

    /// <summary>
    /// Get emission report by ID.
    /// </summary>
    Task<ServiceResult<EmissionReportResponseDto>> GetEmissionReportByIdAsync(int emissionReportId);

    /// <summary>
    /// Get all emission reports (Station Authority).
    /// </summary>
    Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetAllEmissionReportsAsync();

    /// <summary>
    /// Get emission reports by device.
    /// </summary>
    Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetEmissionReportsByDeviceAsync(int deviceId);

    /// <summary>
    /// Get emission reports by date range.
    /// </summary>
    Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetEmissionReportsByDateRangeAsync(
        DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get violation reports (sound level exceeds threshold).
    /// </summary>
    Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetViolationReportsAsync(
        decimal soundThreshold = 85.0m);

    /// <summary>
    /// Get reports without challans (pending action).
    /// </summary>
    Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetReportsWithoutChallansAsync();

    /// <summary>
    /// Verify emission report integrity (digital signature check).
    /// </summary>
    Task<ServiceResult<VerifyEmissionReportDto>> VerifyEmissionReportIntegrityAsync(int emissionReportId);
}