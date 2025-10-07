using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Emissionreport entity operations.
/// </summary>
public interface IEmissionreportRepository
{
    /// <summary>
    /// Create a new emission report (immutable after creation).
    /// </summary>
    Task<int> CreateAsync(Emissionreport emissionReport);

    /// <summary>
    /// Get emission report by ID with navigation properties.
    /// </summary>
    Task<Emissionreport?> GetByIdAsync(int emissionReportId);

    /// <summary>
    /// Get all emission reports.
    /// </summary>
    Task<IEnumerable<Emissionreport>> GetAllAsync();

    /// <summary>
    /// Get emission reports by device ID.
    /// </summary>
    Task<IEnumerable<Emissionreport>> GetByDeviceAsync(int deviceId);

    /// <summary>
    /// Get emission reports by date range.
    /// </summary>
    Task<IEnumerable<Emissionreport>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get emission reports with violations (sound level exceeds threshold).
    /// </summary>
    Task<IEnumerable<Emissionreport>> GetViolationReportsAsync(decimal soundThreshold = 85.0m);

    /// <summary>
    /// Check if emission report exists.
    /// </summary>
    Task<bool> ExistsAsync(int emissionReportId);

    /// <summary>
    /// Check for duplicate readings (same device, similar time).
    /// </summary>
    Task<bool> CheckDuplicateReadingAsync(int deviceId, DateTime testDateTime, int withinMinutes = 5);

    /// <summary>
    /// Get emission reports that don't have challans yet.
    /// </summary>
    Task<IEnumerable<Emissionreport>> GetReportsWithoutChallansAsync();
}