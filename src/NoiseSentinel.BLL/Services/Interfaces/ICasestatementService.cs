using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.CaseStatement;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Case Statement management operations.
/// </summary>
public interface ICasestatementService
{
    /// <summary>
    /// Create a new case statement (Judge only).
    /// </summary>
    Task<ServiceResult<CaseStatementResponseDto>> CreateCaseStatementAsync(
        CreateCaseStatementDto dto, int creatorUserId);

    /// <summary>
    /// Get case statement by ID.
    /// </summary>
    Task<ServiceResult<CaseStatementResponseDto>> GetCaseStatementByIdAsync(int statementId);

    /// <summary>
    /// Get all case statements for a specific case.
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseStatementListItemDto>>> GetStatementsByCaseAsync(int caseId);

    /// <summary>
    /// Get all case statements.
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseStatementListItemDto>>> GetAllCaseStatementsAsync();

    /// <summary>
    /// Get latest statement for a case.
    /// </summary>
    Task<ServiceResult<CaseStatementResponseDto>> GetLatestStatementForCaseAsync(int caseId);

    /// <summary>
    /// Update case statement (Judge only).
    /// </summary>
    Task<ServiceResult<CaseStatementResponseDto>> UpdateCaseStatementAsync(
        UpdateCaseStatementDto dto, int updaterUserId);

    /// <summary>
    /// Delete case statement (Judge only - before final verdict).
    /// </summary>
    Task<ServiceResult<string>> DeleteCaseStatementAsync(int statementId, int deleterUserId);
}