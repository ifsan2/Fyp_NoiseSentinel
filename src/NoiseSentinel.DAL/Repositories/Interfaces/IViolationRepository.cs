using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Violation entity operations.
/// </summary>
public interface IViolationRepository
{
    /// <summary>
    /// Create a new violation.
    /// </summary>
    Task<int> CreateAsync(Violation violation);

    /// <summary>
    /// Get violation by ID with navigation properties.
    /// </summary>
    Task<Violation?> GetByIdAsync(int violationId);

    /// <summary>
    /// Get all violations.
    /// </summary>
    Task<IEnumerable<Violation>> GetAllAsync();

    /// <summary>
    /// Get all cognizable violations (for FIR workflow).
    /// </summary>
    Task<IEnumerable<Violation>> GetCognizableViolationsAsync();

    /// <summary>
    /// Get violations by type.
    /// </summary>
    Task<IEnumerable<Violation>> GetByTypeAsync(string violationType);

    /// <summary>
    /// Update an existing violation.
    /// </summary>
    Task<bool> UpdateAsync(Violation violation);

    /// <summary>
    /// Delete a violation (soft or hard delete).
    /// </summary>
    Task<bool> DeleteAsync(int violationId);

    /// <summary>
    /// Check if violation type already exists (case-insensitive).
    /// </summary>
    Task<bool> ViolationTypeExistsAsync(string violationType, int? excludeViolationId = null);

    /// <summary>
    /// Check if violation exists.
    /// </summary>
    Task<bool> ExistsAsync(int violationId);

    /// <summary>
    /// Check if violation has any challans linked.
    /// </summary>
    Task<bool> HasChallansAsync(int violationId);
}