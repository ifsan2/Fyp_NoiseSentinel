using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Case entity operations.
/// </summary>
public interface ICaseRepository
{
    /// <summary>
    /// Create a new case.
    /// </summary>
    Task<int> CreateAsync(Case caseEntity);

    /// <summary>
    /// Get case by ID with all navigation properties.
    /// </summary>
    Task<Case?> GetByIdAsync(int caseId);

    /// <summary>
    /// Get case by case number.
    /// </summary>
    Task<Case?> GetByCaseNoAsync(string caseNo);

    /// <summary>
    /// Get all cases.
    /// </summary>
    Task<IEnumerable<Case>> GetAllAsync();

    /// <summary>
    /// Get cases by judge (assigned cases).
    /// </summary>
    Task<IEnumerable<Case>> GetByJudgeAsync(int judgeId);

    /// <summary>
    /// Get cases by court.
    /// </summary>
    Task<IEnumerable<Case>> GetByCourtAsync(int courtId);

    /// <summary>
    /// Get cases by status.
    /// </summary>
    Task<IEnumerable<Case>> GetByStatusAsync(string status);

    /// <summary>
    /// Get cases by case type.
    /// </summary>
    Task<IEnumerable<Case>> GetByCaseTypeAsync(string caseType);

    /// <summary>
    /// Get cases by hearing date range.
    /// </summary>
    Task<IEnumerable<Case>> GetByHearingDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Update an existing case.
    /// </summary>
    Task<bool> UpdateAsync(Case caseEntity);

    /// <summary>
    /// Check if case exists.
    /// </summary>
    Task<bool> ExistsAsync(int caseId);

    /// <summary>
    /// Check if case number already exists.
    /// </summary>
    Task<bool> CaseNoExistsAsync(string caseNo);

    /// <summary>
    /// Check if FIR already has a case.
    /// </summary>
    Task<bool> FirHasCaseAsync(int firId);

    /// <summary>
    /// Get next case number for court (auto-increment).
    /// </summary>
    Task<int> GetNextCaseNumberForCourtAsync(int courtId, int year);
}