using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Accused entity operations.
/// </summary>
public interface IAccusedRepository
{
    /// <summary>
    /// Create a new accused person.
    /// </summary>
    Task<int> CreateAsync(Accused accused);

    /// <summary>
    /// Get accused by ID with navigation properties.
    /// </summary>
    Task<Accused?> GetByIdAsync(int accusedId);

    /// <summary>
    /// Get accused by CNIC (unique identifier).
    /// </summary>
    Task<Accused?> GetByCnicAsync(string cnic);

    /// <summary>
    /// Get all accused persons.
    /// </summary>
    Task<IEnumerable<Accused>> GetAllAsync();

    /// <summary>
    /// Search accused by name (partial match).
    /// </summary>
    Task<IEnumerable<Accused>> SearchByNameAsync(string name);

    /// <summary>
    /// Get accused by province.
    /// </summary>
    Task<IEnumerable<Accused>> GetByProvinceAsync(string province);

    /// <summary>
    /// Get accused by city.
    /// </summary>
    Task<IEnumerable<Accused>> GetByCityAsync(string city);

    /// <summary>
    /// Update an existing accused.
    /// </summary>
    Task<bool> UpdateAsync(Accused accused);

    /// <summary>
    /// Delete an accused.
    /// </summary>
    Task<bool> DeleteAsync(int accusedId);

    /// <summary>
    /// Check if CNIC already exists (case-insensitive).
    /// </summary>
    Task<bool> CnicExistsAsync(string cnic, int? excludeAccusedId = null);

    /// <summary>
    /// Check if accused exists.
    /// </summary>
    Task<bool> ExistsAsync(int accusedId);

    /// <summary>
    /// Get accused violation count (total challans).
    /// </summary>
    Task<int> GetViolationCountAsync(int accusedId);

    /// <summary>
    /// Get accused vehicle count (total vehicles owned).
    /// </summary>
    Task<int> GetVehicleCountAsync(int accusedId);
}