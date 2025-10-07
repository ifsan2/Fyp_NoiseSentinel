using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Case;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Case management operations.
/// </summary>
public interface ICaseService
{
    /// <summary>
    /// Create a new case from FIR (Court Authority only).
    /// </summary>
    Task<ServiceResult<CaseResponseDto>> CreateCaseAsync(CreateCaseDto dto, int creatorUserId);

    /// <summary>
    /// Get case by ID.
    /// </summary>
    Task<ServiceResult<CaseResponseDto>> GetCaseByIdAsync(int caseId);

    /// <summary>
    /// Get case by case number.
    /// </summary>
    Task<ServiceResult<CaseResponseDto>> GetCaseByCaseNoAsync(string caseNo);

    /// <summary>
    /// Get all cases.
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetAllCasesAsync();

    /// <summary>
    /// Get cases assigned to judge (Judge sees their cases).
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByJudgeAsync(int judgeId);

    /// <summary>
    /// Get cases by court.
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByCourtAsync(int courtId);

    /// <summary>
    /// Get cases by status.
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByStatusAsync(string status);

    /// <summary>
    /// Get cases by hearing date range.
    /// </summary>
    Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByHearingDateRangeAsync(
        DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get FIRs without cases (eligible for case creation).
    /// </summary>
    Task<ServiceResult<IEnumerable<FirWithoutCaseDto>>> GetFirsWithoutCasesAsync();

    /// <summary>
    /// Update case details (Court Authority or Judge).
    /// </summary>
    Task<ServiceResult<CaseResponseDto>> UpdateCaseAsync(UpdateCaseDto dto, int updaterUserId);

    /// <summary>
    /// Assign/Reassign judge to case (Court Authority only).
    /// </summary>
    Task<ServiceResult<CaseResponseDto>> AssignJudgeAsync(AssignJudgeDto dto, int assignerUserId);
}