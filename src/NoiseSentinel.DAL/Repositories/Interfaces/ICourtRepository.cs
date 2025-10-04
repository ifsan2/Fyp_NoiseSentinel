using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Court entity operations.
/// </summary>
public interface ICourtRepository
{
    /// <summary>
    /// Create a new court.
    /// </summary>
    Task<int> CreateAsync(Court court);

    /// <summary>
    /// Get court by ID with navigation properties.
    /// </summary>
    Task<Court?> GetByIdAsync(int courtId);

    /// <summary>
    /// Get all courts with navigation properties.
    /// </summary>
    Task<IEnumerable<Court>> GetAllAsync();

    /// <summary>
    /// Get courts by type.
    /// </summary>
    Task<IEnumerable<Court>> GetByTypeAsync(int courtTypeId);

    /// <summary>
    /// Get courts by province.
    /// </summary>
    Task<IEnumerable<Court>> GetByProvinceAsync(string province);

    /// <summary>
    /// Update an existing court.
    /// </summary>
    Task<bool> UpdateAsync(Court court);

    /// <summary>
    /// Delete a court.
    /// </summary>
    Task<bool> DeleteAsync(int courtId);

    /// <summary>
    /// Check if court name exists in the same province.
    /// </summary>
    Task<bool> CourtNameExistsAsync(string courtName, string province, int? excludeCourtId = null);

    /// <summary>
    /// Check if court exists.
    /// </summary>
    Task<bool> ExistsAsync(int courtId);
}