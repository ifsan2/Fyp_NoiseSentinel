using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.CaseStatement;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for Case Statement management operations.
/// </summary>
public class CasestatementService : ICasestatementService
{
    private readonly ICasestatementRepository _casestatementRepository;
    private readonly ICaseRepository _caseRepository;
    private readonly NoiseSentinelDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<CasestatementService> _logger;

    public CasestatementService(
        ICasestatementRepository casestatementRepository,
        ICaseRepository caseRepository,
        NoiseSentinelDbContext context,
        IEmailService emailService,
        ILogger<CasestatementService> logger)
    {
        _casestatementRepository = casestatementRepository;
        _caseRepository = caseRepository;
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ServiceResult<CaseStatementResponseDto>> CreateCaseStatementAsync(
        CreateCaseStatementDto dto, int creatorUserId)
    {
        // ========================================================================
        // STEP 1: VERIFY CREATOR IS JUDGE
        // ========================================================================

        var creator = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Judges)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Judge")
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                "Only Judges can create case statements.");
        }

        if (creator.Judges == null || !creator.Judges.Any())
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                "Judge record not found for this user.");
        }

        var judge = creator.Judges.First();

        // ========================================================================
        // STEP 2: VALIDATE CASE
        // ========================================================================

        var caseEntity = await _caseRepository.GetByIdAsync(dto.CaseId);
        if (caseEntity == null)
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                $"Case with ID {dto.CaseId} not found.");
        }

        // ========================================================================
        // STEP 3: VERIFY JUDGE IS ASSIGNED TO THIS CASE
        // ========================================================================

        if (caseEntity.JudgeId != judge.JudgeId)
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                "You can only create statements for cases assigned to you.");
        }

        // ========================================================================
        // STEP 4: CREATE CASE STATEMENT
        // ========================================================================

        var statementBy = dto.StatementBy ?? creator.FullName ?? "Judge";

        var casestatement = new Casestatement
        {
            CaseId = dto.CaseId,
            StatementBy = statementBy,
            StatementText = dto.StatementText,
            StatementDate = DateTime.UtcNow
        };

        var statementId = await _casestatementRepository.CreateAsync(casestatement);

        // ========================================================================
        // STEP 5: RETRIEVE AND MAP RESPONSE
        // ========================================================================

        var createdStatement = await _casestatementRepository.GetByIdAsync(statementId);

        var response = MapToCaseStatementResponseDto(createdStatement!);

        // ========================================================================
        // STEP 6: SEND EMAIL NOTIFICATION TO ACCUSED (IF EMAIL EXISTS)
        // ========================================================================

        try
        {
            // Get accused email from case -> fir -> challan -> accused
            var accusedEmail = await _context.Cases
                .Where(c => c.CaseId == dto.CaseId)
                .Select(c => c.Fir!.Challan!.Accused!.Email)
                .FirstOrDefaultAsync();

            var accusedName = await _context.Cases
                .Where(c => c.CaseId == dto.CaseId)
                .Select(c => c.Fir!.Challan!.Accused!.FullName)
                .FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(accusedEmail))
            {
                // Get summary (first 200 chars of statement)
                var statementSummary = dto.StatementText.Length > 200 
                    ? dto.StatementText.Substring(0, 200) + "..." 
                    : dto.StatementText;

                await _emailService.SendCaseStatementAddedEmailAsync(
                    toEmail: accusedEmail,
                    accusedName: accusedName ?? "Sir/Madam",
                    caseNo: caseEntity.CaseNo ?? "N/A",
                    statementBy: statementBy,
                    statementSummary: statementSummary,
                    statementDate: casestatement.StatementDate ?? DateTime.UtcNow
                );
                _logger.LogInformation("Case statement email notification sent to {Email} for Case {CaseNo}", accusedEmail, caseEntity.CaseNo);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send case statement email notification for Case {CaseNo}", caseEntity.CaseNo);
        }

        return ServiceResult<CaseStatementResponseDto>.SuccessResult(
            response,
            $"Case statement for {caseEntity.CaseNo} recorded successfully.");
    }

    public async Task<ServiceResult<CaseStatementResponseDto>> GetCaseStatementByIdAsync(int statementId)
    {
        var casestatement = await _casestatementRepository.GetByIdAsync(statementId);

        if (casestatement == null)
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                $"Case statement with ID {statementId} not found.");
        }

        var response = MapToCaseStatementResponseDto(casestatement);

        return ServiceResult<CaseStatementResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseStatementListItemDto>>> GetStatementsByCaseAsync(int caseId)
    {
        var statements = await _casestatementRepository.GetByCaseAsync(caseId);

        var response = statements.Select(MapToCaseStatementListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseStatementListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseStatementListItemDto>>> GetAllCaseStatementsAsync()
    {
        var statements = await _casestatementRepository.GetAllAsync();

        var response = statements.Select(MapToCaseStatementListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseStatementListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<CaseStatementResponseDto>> GetLatestStatementForCaseAsync(int caseId)
    {
        var statement = await _casestatementRepository.GetLatestStatementForCaseAsync(caseId);

        if (statement == null)
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                $"No statements found for case {caseId}.");
        }

        var response = MapToCaseStatementResponseDto(statement);

        return ServiceResult<CaseStatementResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<CaseStatementResponseDto>> UpdateCaseStatementAsync(
        UpdateCaseStatementDto dto, int updaterUserId)
    {
        // Verify updater is Judge
        var updater = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Judges)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Judge")
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                "Only Judges can update case statements.");
        }

        if (updater.Judges == null || !updater.Judges.Any())
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                "Judge record not found for this user.");
        }

        var judge = updater.Judges.First();

        // Get existing statement
        var existingStatement = await _casestatementRepository.GetByIdAsync(dto.StatementId);
        if (existingStatement == null)
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                $"Case statement with ID {dto.StatementId} not found.");
        }

        // Verify judge is assigned to this case
        var caseEntity = existingStatement.Case;
        if (caseEntity?.JudgeId != judge.JudgeId)
        {
            return ServiceResult<CaseStatementResponseDto>.FailureResult(
                "You can only update statements for cases assigned to you.");
        }

        // Update statement
        existingStatement.StatementText = dto.StatementText;
        existingStatement.StatementDate = DateTime.UtcNow; // Update timestamp

        await _casestatementRepository.UpdateAsync(existingStatement);

        // Retrieve updated statement
        var updatedStatement = await _casestatementRepository.GetByIdAsync(dto.StatementId);

        var response = MapToCaseStatementResponseDto(updatedStatement!);

        return ServiceResult<CaseStatementResponseDto>.SuccessResult(
            response,
            "Case statement updated successfully.");
    }

    public async Task<ServiceResult<string>> DeleteCaseStatementAsync(int statementId, int deleterUserId)
    {
        // Verify deleter is Judge
        var deleter = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Judges)
            .FirstOrDefaultAsync(u => u.Id == deleterUserId);

        if (deleter?.Role?.RoleName != "Judge")
        {
            return ServiceResult<string>.FailureResult(
                "Only Judges can delete case statements.");
        }

        if (deleter.Judges == null || !deleter.Judges.Any())
        {
            return ServiceResult<string>.FailureResult(
                "Judge record not found for this user.");
        }

        var judge = deleter.Judges.First();

        // Get existing statement
        var statement = await _casestatementRepository.GetByIdAsync(statementId);
        if (statement == null)
        {
            return ServiceResult<string>.FailureResult(
                $"Case statement with ID {statementId} not found.");
        }

        // Verify judge is assigned to this case
        var caseEntity = statement.Case;
        if (caseEntity?.JudgeId != judge.JudgeId)
        {
            return ServiceResult<string>.FailureResult(
                "You can only delete statements for cases assigned to you.");
        }

        var deleted = await _casestatementRepository.DeleteAsync(statementId);

        if (!deleted)
        {
            return ServiceResult<string>.FailureResult("Failed to delete case statement.");
        }

        return ServiceResult<string>.SuccessResult(
            "Case statement deleted successfully.");
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private CaseStatementResponseDto MapToCaseStatementResponseDto(Casestatement casestatement)
    {
        return new CaseStatementResponseDto
        {
            StatementId = casestatement.StatementId,
            CaseId = casestatement.CaseId ?? 0,
            CaseNo = casestatement.Case?.CaseNo ?? string.Empty,
            StatementBy = casestatement.StatementBy ?? string.Empty,
            StatementText = casestatement.StatementText ?? string.Empty,
            StatementDate = casestatement.StatementDate ?? DateTime.MinValue,

            // Case Details
            CaseType = casestatement.Case?.CaseType ?? string.Empty,
            CaseStatus = casestatement.Case?.CaseStatus ?? string.Empty,
            JudgeName = casestatement.Case?.Judge?.User?.FullName ?? string.Empty,
            CourtName = casestatement.Case?.Judge?.Court?.CourtName ?? string.Empty,

            // Accused Details
            AccusedName = casestatement.Case?.Fir?.Challan?.Accused?.FullName ?? string.Empty,
            VehiclePlateNumber = casestatement.Case?.Fir?.Challan?.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = casestatement.Case?.Fir?.Challan?.Violation?.ViolationType ?? string.Empty
        };
    }

    private CaseStatementListItemDto MapToCaseStatementListItemDto(Casestatement casestatement)
    {
        var statementText = casestatement.StatementText ?? string.Empty;
        var preview = statementText.Length > 100
            ? statementText.Substring(0, 100) + "..."
            : statementText;

        return new CaseStatementListItemDto
        {
            StatementId = casestatement.StatementId,
            CaseId = casestatement.CaseId ?? 0,
            CaseNo = casestatement.Case?.CaseNo ?? string.Empty,
            StatementBy = casestatement.StatementBy ?? string.Empty,
            StatementDate = casestatement.StatementDate ?? DateTime.MinValue,
            JudgeName = casestatement.Case?.Judge?.User?.FullName ?? string.Empty,
            CourtName = casestatement.Case?.Judge?.Court?.CourtName ?? string.Empty,
            StatementPreview = preview
        };
    }
}