using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for FIR (First Information Report) entity operations.
/// </summary>
public interface IFirRepository
{
    /// <summary>
    /// Create a new FIR.
    /// </summary>
    Task<int> CreateAsync(Fir fir);

    /// <summary>
    /// Get FIR by ID with all navigation properties.
    /// </summary>
    Task<Fir?> GetByIdAsync(int firId);

    /// <summary>
    /// Get FIR by FIR number.
    /// </summary>
    Task<Fir?> GetByFirNoAsync(string firNo);

    /// <summary>
    /// Get all FIRs.
    /// </summary>
    Task<IEnumerable<Fir>> GetAllAsync();

    /// <summary>
    /// Get FIRs by station.
    /// </summary>
    Task<IEnumerable<Fir>> GetByStationAsync(int stationId);

    /// <summary>
    /// Get FIRs by informant (police officer).
    /// </summary>
    Task<IEnumerable<Fir>> GetByInformantAsync(int informantId);

    /// <summary>
    /// Get FIRs by status.
    /// </summary>
    Task<IEnumerable<Fir>> GetByStatusAsync(string status);

    /// <summary>
    /// Get FIRs by date range.
    /// </summary>
    Task<IEnumerable<Fir>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Update an existing FIR (status, investigation report).
    /// </summary>
    Task<bool> UpdateAsync(Fir fir);

    /// <summary>
    /// Check if FIR exists.
    /// </summary>
    Task<bool> ExistsAsync(int firId);

    /// <summary>
    /// Check if FIR number already exists.
    /// </summary>
    Task<bool> FirNoExistsAsync(string firNo);

    /// <summary>
    /// Check if challan already has an FIR.
    /// </summary>
    Task<bool> ChallanHasFirAsync(int challanId);

    /// <summary>
    /// Get next FIR number for station (auto-increment).
    /// </summary>
    Task<int> GetNextFirNumberForStationAsync(int stationId, int year);
}