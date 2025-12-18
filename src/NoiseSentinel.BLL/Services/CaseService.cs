using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Case;
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
/// Service implementation for Case management operations.
/// </summary>
public class CaseService : ICaseService
{
    private readonly ICaseRepository _caseRepository;
    private readonly IFirRepository _firRepository;
    private readonly NoiseSentinelDbContext _context;

    public CaseService(
        ICaseRepository caseRepository,
        IFirRepository firRepository,
        NoiseSentinelDbContext context)
    {
        _caseRepository = caseRepository;
        _firRepository = firRepository;
        _context = context;
    }

    public async Task<ServiceResult<CaseResponseDto>> CreateCaseAsync(CreateCaseDto dto, int creatorUserId)
    {
        // ========================================================================
        // STEP 1: VERIFY CREATOR IS COURT AUTHORITY
        // ========================================================================

        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Court Authority")
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                "Only Court Authority can create cases.");
        }

        // ========================================================================
        // STEP 2: VALIDATE FIR
        // ========================================================================

        var fir = await _firRepository.GetByIdAsync(dto.FirId);
        if (fir == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"FIR with ID {dto.FirId} not found.");
        }

        // ========================================================================
        // STEP 3: CHECK IF FIR ALREADY HAS CASE
        // ========================================================================

        var firHasCase = await _caseRepository.FirHasCaseAsync(dto.FirId);
        if (firHasCase)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"FIR #{dto.FirId} ({fir.Firno}) already has a case. Each FIR can only have one case.");
        }

        // ========================================================================
        // STEP 4: VALIDATE JUDGE (FIXED - Use DbContext)
        // ========================================================================

        var judge = await _context.Judges
            .Include(j => j.User)
            .Include(j => j.Court)
                .ThenInclude(c => c!.CourtType)
            .FirstOrDefaultAsync(j => j.JudgeId == dto.JudgeId);

        if (judge == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"Judge with ID {dto.JudgeId} not found.");
        }

        // ========================================================================
        // STEP 5: AUTO-GENERATE CASE NUMBER
        // ========================================================================

        var court = judge.Court;
        if (court == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                "Court information not found for judge.");
        }

        var currentYear = DateTime.UtcNow.Year;
        var nextNumber = await _caseRepository.GetNextCaseNumberForCourtAsync(court.CourtId, currentYear);

        // Format: CASE-{CourtType}-{City}-{Year}-{SequenceNumber:0000}
        var courtTypeAbbr = GetCourtTypeAbbreviation(court.CourtType?.CourtTypeName ?? "Court");
        var cityAbbr = GetCityAbbreviation(court.Location ?? "City");
        var caseNo = $"CASE-{courtTypeAbbr}-{cityAbbr}-{currentYear}-{nextNumber:D4}";

        // ========================================================================
        // STEP 6: SET HEARING DATE (DEFAULT 30 DAYS FROM NOW IF NOT PROVIDED)
        // ========================================================================

        var hearingDate = dto.HearingDate ?? DateTime.UtcNow.AddDays(30);

        // ========================================================================
        // STEP 7: CREATE CASE
        // ========================================================================

        var caseEntity = new Case
        {
            Firid = dto.FirId,
            JudgeId = dto.JudgeId,
            CaseNo = caseNo,
            CaseType = dto.CaseType ?? "Traffic Violation",
            CaseStatus = "Pending",
            HearingDate = hearingDate,
            Verdict = null
        };

        var caseId = await _caseRepository.CreateAsync(caseEntity);

        // ========================================================================
        // STEP 8: RETRIEVE AND MAP RESPONSE
        // ========================================================================

        var createdCase = await _caseRepository.GetByIdAsync(caseId);

        var response = MapToCaseResponseDto(createdCase!);

        return ServiceResult<CaseResponseDto>.SuccessResult(
            response,
            $"Case {caseNo} created successfully and assigned to {judge.User?.FullName}. " +
            $"Hearing scheduled for {hearingDate:yyyy-MM-dd}.");
    }

    public async Task<ServiceResult<CaseResponseDto>> GetCaseByIdAsync(int caseId)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(caseId);

        if (caseEntity == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"Case with ID {caseId} not found.");
        }

        var response = MapToCaseResponseDto(caseEntity);

        return ServiceResult<CaseResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<CaseResponseDto>> GetCaseByCaseNoAsync(string caseNo)
    {
        var caseEntity = await _caseRepository.GetByCaseNoAsync(caseNo);

        if (caseEntity == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"Case with number '{caseNo}' not found.");
        }

        var response = MapToCaseResponseDto(caseEntity);

        return ServiceResult<CaseResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetAllCasesAsync()
    {
        var cases = await _caseRepository.GetAllAsync();

        var response = cases.Select(MapToCaseListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByJudgeAsync(int judgeId)
    {
        var cases = await _caseRepository.GetByJudgeAsync(judgeId);

        var response = cases.Select(MapToCaseListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByCourtAsync(int courtId)
    {
        var cases = await _caseRepository.GetByCourtAsync(courtId);

        var response = cases.Select(MapToCaseListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByStatusAsync(string status)
    {
        var cases = await _caseRepository.GetByStatusAsync(status);

        var response = cases.Select(MapToCaseListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CaseListItemDto>>> GetCasesByHearingDateRangeAsync(
        DateTime startDate, DateTime endDate)
    {
        var cases = await _caseRepository.GetByHearingDateRangeAsync(startDate, endDate);

        var response = cases.Select(MapToCaseListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<FirWithoutCaseDto>>> GetFirsWithoutCasesAsync()
    {
        // Get all FIRs that don't have cases yet
        var firs = await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Cases)
            .Where(f => !f.Cases.Any())
            .OrderByDescending(f => f.DateFiled)
            .ToListAsync();

        var response = firs.Select(f => new FirWithoutCaseDto
        {
            FirId = f.Firid,
            FirNo = f.Firno ?? string.Empty,
            StationName = f.Station?.StationName ?? string.Empty,
            AccusedName = f.Challan?.Accused?.FullName ?? string.Empty,
            AccusedCnic = f.Challan?.Accused?.Cnic ?? string.Empty,
            VehiclePlateNumber = f.Challan?.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = f.Challan?.Violation?.ViolationType ?? string.Empty,
            FirDateFiled = f.DateFiled ?? DateTime.MinValue,
            FirStatus = f.Firstatus ?? string.Empty,
            HasCase = false
        }).ToList();

        return ServiceResult<IEnumerable<FirWithoutCaseDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<CaseResponseDto>> UpdateCaseAsync(UpdateCaseDto dto, int updaterUserId)
    {
        // Verify updater is Court Authority or Judge
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Court Authority" &&
            updater?.Role?.RoleName != "Judge")
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                "Only Court Authority or Judge can update cases.");
        }

        // Get existing case
        var existingCase = await _caseRepository.GetByIdAsync(dto.CaseId);
        if (existingCase == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"Case with ID {dto.CaseId} not found.");
        }

        // Update case
        if (!string.IsNullOrEmpty(dto.CaseStatus))
            existingCase.CaseStatus = dto.CaseStatus;

        if (dto.HearingDate.HasValue)
            existingCase.HearingDate = dto.HearingDate;

        if (!string.IsNullOrEmpty(dto.Verdict))
        {
            existingCase.Verdict = dto.Verdict;
            
            // Auto-update case status based on verdict if status not explicitly provided
            if (string.IsNullOrEmpty(dto.CaseStatus))
            {
                var verdictLower = dto.Verdict.ToLower();
                
                if (verdictLower.Contains("convicted") || verdictLower.Contains("guilty"))
                {
                    existingCase.CaseStatus = "Convicted";
                }
                else if (verdictLower.Contains("acquitted") || verdictLower.Contains("not guilty"))
                {
                    existingCase.CaseStatus = "Acquitted";
                }
                else if (verdictLower.Contains("dismissed"))
                {
                    existingCase.CaseStatus = "Dismissed";
                }
                else
                {
                    // If verdict is provided but doesn't match specific keywords, mark as Closed
                    existingCase.CaseStatus = "Closed";
                }
            }
        }

        await _caseRepository.UpdateAsync(existingCase);

        // Retrieve updated case
        var updatedCase = await _caseRepository.GetByIdAsync(dto.CaseId);

        var response = MapToCaseResponseDto(updatedCase!);

        return ServiceResult<CaseResponseDto>.SuccessResult(
            response,
            $"Case {updatedCase!.CaseNo} updated successfully.");
    }

    public async Task<ServiceResult<CaseResponseDto>> AssignJudgeAsync(AssignJudgeDto dto, int assignerUserId)
    {
        // Verify assigner is Court Authority
        var assigner = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == assignerUserId);

        if (assigner?.Role?.RoleName != "Court Authority")
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                "Only Court Authority can assign judges to cases.");
        }

        // Get existing case
        var existingCase = await _caseRepository.GetByIdAsync(dto.CaseId);
        if (existingCase == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"Case with ID {dto.CaseId} not found.");
        }

        // Validate new judge (FIXED - Use DbContext)
        var judge = await _context.Judges
            .Include(j => j.User)
            .Include(j => j.Court)
            .FirstOrDefaultAsync(j => j.JudgeId == dto.JudgeId);

        if (judge == null)
        {
            return ServiceResult<CaseResponseDto>.FailureResult(
                $"Judge with ID {dto.JudgeId} not found.");
        }

        // Assign judge
        existingCase.JudgeId = dto.JudgeId;

        await _caseRepository.UpdateAsync(existingCase);

        // Retrieve updated case
        var updatedCase = await _caseRepository.GetByIdAsync(dto.CaseId);

        var response = MapToCaseResponseDto(updatedCase!);

        return ServiceResult<CaseResponseDto>.SuccessResult(
            response,
            $"Case {updatedCase!.CaseNo} reassigned to {judge.User?.FullName}.");
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private CaseResponseDto MapToCaseResponseDto(Case caseEntity)
    {
        return new CaseResponseDto
        {
            CaseId = caseEntity.CaseId,
            CaseNo = caseEntity.CaseNo ?? string.Empty,
            CaseType = caseEntity.CaseType ?? string.Empty,
            CaseStatus = caseEntity.CaseStatus ?? string.Empty,
            HearingDate = caseEntity.HearingDate,
            Verdict = caseEntity.Verdict,

            // Judge (FIXED - Use Rank instead of Designation)
            JudgeId = caseEntity.JudgeId ?? 0,
            JudgeName = caseEntity.Judge?.User?.FullName ?? string.Empty,
            JudgeDesignation = caseEntity.Judge?.Rank ?? "Judge", // FIXED: Use Rank field
            CourtName = caseEntity.Judge?.Court?.CourtName ?? string.Empty,
            CourtType = caseEntity.Judge?.Court?.CourtType?.CourtTypeName ?? string.Empty,

            // FIR
            FirId = caseEntity.Firid ?? 0,
            FirNo = caseEntity.Fir?.Firno ?? string.Empty,
            StationName = caseEntity.Fir?.Station?.StationName ?? string.Empty,
            FirDateFiled = caseEntity.Fir?.DateFiled ?? DateTime.MinValue,

            // Challan
            ChallanId = caseEntity.Fir?.ChallanId ?? 0,
            AccusedName = caseEntity.Fir?.Challan?.Accused?.FullName ?? string.Empty,
            AccusedCnic = caseEntity.Fir?.Challan?.Accused?.Cnic ?? string.Empty,
            VehiclePlateNumber = caseEntity.Fir?.Challan?.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = caseEntity.Fir?.Challan?.Violation?.ViolationType ?? string.Empty,
            PenaltyAmount = caseEntity.Fir?.Challan?.Violation?.PenaltyAmount ?? 0,

            // Emission Report
            EmissionReportId = caseEntity.Fir?.Challan?.EmissionReportId ?? 0,
            SoundLevelDBa = caseEntity.Fir?.Challan?.EmissionReport?.SoundLevelDBa ?? 0,
            MlClassification = caseEntity.Fir?.Challan?.EmissionReport?.MlClassification,
            DigitalSignatureValue = caseEntity.Fir?.Challan?.EmissionReport?.DigitalSignatureValue ?? string.Empty,

            // Case Statements
            HasCaseStatement = caseEntity.Casestatements?.Any() ?? false,
            CaseStatementCount = caseEntity.Casestatements?.Count ?? 0
        };
    }

    private CaseListItemDto MapToCaseListItemDto(Case caseEntity)
    {
        return new CaseListItemDto
        {
            CaseId = caseEntity.CaseId,
            CaseNo = caseEntity.CaseNo ?? string.Empty,
            CaseType = caseEntity.CaseType ?? string.Empty,
            CaseStatus = caseEntity.CaseStatus ?? string.Empty,
            JudgeName = caseEntity.Judge?.User?.FullName ?? string.Empty,
            CourtName = caseEntity.Judge?.Court?.CourtName ?? string.Empty,
            AccusedName = caseEntity.Fir?.Challan?.Accused?.FullName ?? string.Empty,
            ViolationType = caseEntity.Fir?.Challan?.Violation?.ViolationType ?? string.Empty,
            HearingDate = caseEntity.HearingDate,
            Verdict = caseEntity.Verdict,
            HasCaseStatement = caseEntity.Casestatements?.Any() ?? false
        };
    }

    private string GetCourtTypeAbbreviation(string courtType)
    {
        return courtType.ToLower() switch
        {
            "supreme court" => "SC",
            "high court" => "HC",
            "district court" => "DC",
            "civil court" => "CC",
            "sessions court" => "SESS",
            _ => "COURT"
        };
    }

    private string GetCityAbbreviation(string city)
    {
        return city.ToLower() switch
        {
            var c when c.Contains("lahore") => "LHR",
            var c when c.Contains("karachi") => "KHI",
            var c when c.Contains("islamabad") => "ISB",
            var c when c.Contains("rawalpindi") => "RWP",
            var c when c.Contains("faisalabad") => "FSD",
            var c when c.Contains("multan") => "MUL",
            var c when c.Contains("peshawar") => "PSH",
            var c when c.Contains("quetta") => "QTA",
            _ => city.Length >= 3 ? city.Substring(0, 3).ToUpper() : city.ToUpper()
        };
    }

    public async Task<ServiceResult<IEnumerable<CaseListItemDto>>> SearchCasesAsync(CaseSearchDto searchDto)
    {
        var cases = await _caseRepository.SearchCasesAsync(
            caseNo: searchDto.CaseNo,
            firNo: searchDto.FirNo,
            vehiclePlateNumber: searchDto.VehiclePlateNumber,
            accusedCnic: searchDto.AccusedCnic,
            accusedName: searchDto.AccusedName,
            caseStatus: searchDto.CaseStatus,
            caseType: searchDto.CaseType,
            judgeId: searchDto.JudgeId,
            hearingDateFrom: searchDto.HearingDateFrom,
            hearingDateTo: searchDto.HearingDateTo);

        if (!cases.Any())
        {
            return ServiceResult<IEnumerable<CaseListItemDto>>.FailureResult(
                "No cases found matching the search criteria.");
        }

        var response = cases.Select(MapToCaseListItemDto).ToList();

        return ServiceResult<IEnumerable<CaseListItemDto>>.SuccessResult(
            response,
            $"Found {response.Count} case(s) matching the criteria.");
    }
}