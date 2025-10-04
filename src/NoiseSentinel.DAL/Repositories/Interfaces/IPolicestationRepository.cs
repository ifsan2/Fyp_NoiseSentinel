using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Policestation entity operations.
/// </summary>
public interface IPolicestationRepository
{
    /// <summary>
    /// Create a new police station.
    /// </summary>
    Task<int> CreateAsync(Policestation station);

    /// <summary>
    /// Get police station by ID with navigation properties.
    /// </summary>
    Task<Policestation?> GetByIdAsync(int stationId);

    /// <summary>
    /// Get all police stations.
    /// </summary>
    Task<IEnumerable<Policestation>> GetAllAsync();

    /// <summary>
    /// Get police stations by province.
    /// </summary>
    Task<IEnumerable<Policestation>> GetByProvinceAsync(string province);

    /// <summary>
    /// Get police station by station code.
    /// </summary>
    Task<Policestation?> GetByStationCodeAsync(string stationCode);

    /// <summary>
    /// Update an existing police station.
    /// </summary>
    Task<bool> UpdateAsync(Policestation station);

    /// <summary>
    /// Delete a police station.
    /// </summary>
    Task<bool> DeleteAsync(int stationId);

    /// <summary>
    /// Check if station name exists in the same province.
    /// </summary>
    Task<bool> StationNameExistsAsync(string stationName, string province, int? excludeStationId = null);

    /// <summary>
    /// Check if station code exists.
    /// </summary>
    Task<bool> StationCodeExistsAsync(string stationCode, int? excludeStationId = null);

    /// <summary>
    /// Check if police station exists.
    /// </summary>
    Task<bool> ExistsAsync(int stationId);
}