using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Courttype entity operations.
/// </summary>
public interface ICourttypeRepository
{
    /// <summary>
    /// Get court type by ID.
    /// </summary>
    Task<Courttype?> GetByIdAsync(int courtTypeId);

    /// <summary>
    /// Get court type by name.
    /// </summary>
    Task<Courttype?> GetByNameAsync(string courtTypeName);

    /// <summary>
    /// Get all court types.
    /// </summary>
    Task<IEnumerable<Courttype>> GetAllAsync();

    /// <summary>
    /// Create a new court type.
    /// </summary>
    Task<int> CreateAsync(Courttype courtType);

    /// <summary>
    /// Check if court type exists.
    /// </summary>
    Task<bool> ExistsAsync(int courtTypeId);
}