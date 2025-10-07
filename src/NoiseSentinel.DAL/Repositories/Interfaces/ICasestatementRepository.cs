using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Casestatement entity operations.
/// </summary>
public interface ICasestatementRepository
{
    /// <summary>
    /// Create a new case statement.
    /// </summary>
    Task<int> CreateAsync(Casestatement casestatement);

    /// <summary>
    /// Get case statement by ID with navigation properties.
    /// </summary>
    Task<Casestatement?> GetByIdAsync(int statementId);

    /// <summary>
    /// Get all case statements for a specific case.
    /// </summary>
    Task<IEnumerable<Casestatement>> GetByCaseAsync(int caseId);

    /// <summary>
    /// Get all case statements.
    /// </summary>
    Task<IEnumerable<Casestatement>> GetAllAsync();

    /// <summary>
    /// Get case statements by date range.
    /// </summary>
    Task<IEnumerable<Casestatement>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Update an existing case statement.
    /// </summary>
    Task<bool> UpdateAsync(Casestatement casestatement);

    /// <summary>
    /// Delete a case statement.
    /// </summary>
    Task<bool> DeleteAsync(int statementId);

    /// <summary>
    /// Check if case statement exists.
    /// </summary>
    Task<bool> ExistsAsync(int statementId);

    /// <summary>
    /// Get latest statement for a case.
    /// </summary>
    Task<Casestatement?> GetLatestStatementForCaseAsync(int caseId);
}