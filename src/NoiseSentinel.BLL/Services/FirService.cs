using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Fir;
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
/// Service implementation for FIR management operations.
/// </summary>
public class FirService : IFirService
{
    private readonly IFirRepository _firRepository;
    private readonly IChallanRepository _challanRepository;
    private readonly IPolicestationRepository _policestationRepository;
    private readonly NoiseSentinelDbContext _context;

    public FirService(
        IFirRepository firRepository,
        IChallanRepository challanRepository,
        IPolicestationRepository policestationRepository,
        NoiseSentinelDbContext context)
    {
        _firRepository = firRepository;
        _challanRepository = challanRepository;
        _policestationRepository = policestationRepository;
        _context = context;
    }

    public async Task<ServiceResult<FirResponseDto>> CreateFirAsync(CreateFirDto dto, int creatorUserId)
    {
        // ========================================================================
        // STEP 1: VERIFY CREATOR IS STATION AUTHORITY
        // ========================================================================

        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                "Only Station Authority can create FIRs.");
        }

        // ========================================================================
        // STEP 2: VALIDATE CHALLAN
        // ========================================================================

        var challan = await _challanRepository.GetByIdAsync(dto.ChallanId);
        if (challan == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                $"Challan with ID {dto.ChallanId} not found.");
        }

        // ========================================================================
        // STEP 3: VERIFY VIOLATION IS COGNIZABLE
        // ========================================================================

        if (challan.Violation?.IsCognizable != true)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                $"Cannot create FIR for non-cognizable violation. " +
                $"Violation type '{challan.Violation?.ViolationType}' is not cognizable.");
        }

        // ========================================================================
        // STEP 4: CHECK IF CHALLAN ALREADY HAS FIR
        // ========================================================================

        var challanHasFir = await _firRepository.ChallanHasFirAsync(dto.ChallanId);
        if (challanHasFir)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                $"Challan #{dto.ChallanId} already has an FIR. Each challan can only have one FIR.");
        }

        // ========================================================================
        // STEP 5: GET STATION AND OFFICER DETAILS
        // ========================================================================

        var officer = challan.Officer;
        if (officer == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                "Police Officer information not found in challan.");
        }

        var stationId = officer.StationId;
        if (stationId == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                "Station information not found for the officer.");
        }

        var station = await _policestationRepository.GetByIdAsync(stationId.Value);
        if (station == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                "Station not found.");
        }

        // ========================================================================
        // STEP 6: AUTO-GENERATE FIR NUMBER
        // ========================================================================

        var currentYear = DateTime.UtcNow.Year;
        var nextNumber = await _firRepository.GetNextFirNumberForStationAsync(stationId.Value, currentYear);

        // Format: FIR-{StationCode}-{Year}-{SequenceNumber:0000}
        var stationCode = station.StationCode?.Replace("-", "") ?? "STATION";
        var firNo = $"FIR-{stationCode}-{currentYear}-{nextNumber:D4}";

        // ========================================================================
        // STEP 7: CREATE FIR
        // ========================================================================

        var fir = new Fir
        {
            Firno = firNo,
            StationId = stationId.Value,
            ChallanId = dto.ChallanId,
            DateFiled = DateTime.UtcNow,
            Firdescription = dto.FirDescription,
            Firstatus = "Filed",
            InformantId = officer.OfficerId,
            InvestigationReport = dto.InvestigationReport
        };

        var firId = await _firRepository.CreateAsync(fir);

        // ========================================================================
        // STEP 8: RETRIEVE AND MAP RESPONSE
        // ========================================================================

        var createdFir = await _firRepository.GetByIdAsync(firId);

        var response = MapToFirResponseDto(createdFir!);

        return ServiceResult<FirResponseDto>.SuccessResult(
            response,
            $"FIR {firNo} filed successfully. Case can now be created by Court Authority.");
    }

    public async Task<ServiceResult<FirResponseDto>> GetFirByIdAsync(int firId)
    {
        var fir = await _firRepository.GetByIdAsync(firId);

        if (fir == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                $"FIR with ID {firId} not found.");
        }

        var response = MapToFirResponseDto(fir);

        return ServiceResult<FirResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<FirResponseDto>> GetFirByFirNoAsync(string firNo)
    {
        var fir = await _firRepository.GetByFirNoAsync(firNo);

        if (fir == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                $"FIR with number '{firNo}' not found.");
        }

        var response = MapToFirResponseDto(fir);

        return ServiceResult<FirResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<FirListItemDto>>> GetAllFirsAsync()
    {
        var firs = await _firRepository.GetAllAsync();

        var response = firs.Select(MapToFirListItemDto).ToList();

        return ServiceResult<IEnumerable<FirListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByStationAsync(int stationId)
    {
        var firs = await _firRepository.GetByStationAsync(stationId);

        var response = firs.Select(MapToFirListItemDto).ToList();

        return ServiceResult<IEnumerable<FirListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByInformantAsync(int informantId)
    {
        var firs = await _firRepository.GetByInformantAsync(informantId);

        var response = firs.Select(MapToFirListItemDto).ToList();

        return ServiceResult<IEnumerable<FirListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByStatusAsync(string status)
    {
        var firs = await _firRepository.GetByStatusAsync(status);

        var response = firs.Select(MapToFirListItemDto).ToList();

        return ServiceResult<IEnumerable<FirListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByDateRangeAsync(
        DateTime startDate, DateTime endDate)
    {
        var firs = await _firRepository.GetByDateRangeAsync(startDate, endDate);

        var response = firs.Select(MapToFirListItemDto).ToList();

        return ServiceResult<IEnumerable<FirListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CognizableChallanDto>>> GetCognizableChallansAsync()
    {
        // Get all challans with cognizable violations that don't have FIRs yet
        var challans = await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Include(c => c.Firs)
            .Where(c => c.Violation!.IsCognizable == true && !c.Firs.Any())
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();

        var response = challans.Select(c => new CognizableChallanDto
        {
            ChallanId = c.ChallanId,
            OfficerName = c.Officer?.User?.FullName ?? string.Empty,
            AccusedName = c.Accused?.FullName ?? string.Empty,
            AccusedCnic = c.Accused?.Cnic ?? string.Empty,
            VehiclePlateNumber = c.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = c.Violation?.ViolationType ?? string.Empty,
            PenaltyAmount = c.Violation?.PenaltyAmount ?? 0,
            IssueDateTime = c.IssueDateTime ?? DateTime.MinValue,
            SoundLevelDBa = c.EmissionReport?.SoundLevelDBa ?? 0,
            MlClassification = c.EmissionReport?.MlClassification,
            HasFir = false
        }).ToList();

        return ServiceResult<IEnumerable<CognizableChallanDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<FirResponseDto>> UpdateFirAsync(UpdateFirDto dto, int updaterUserId)
    {
        // Verify updater is Station Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                "Only Station Authority can update FIRs.");
        }

        // Get existing FIR
        var existingFir = await _firRepository.GetByIdAsync(dto.FirId);
        if (existingFir == null)
        {
            return ServiceResult<FirResponseDto>.FailureResult(
                $"FIR with ID {dto.FirId} not found.");
        }

        // Update FIR
        existingFir.Firstatus = dto.FirStatus;
        existingFir.InvestigationReport = dto.InvestigationReport;

        await _firRepository.UpdateAsync(existingFir);

        // Retrieve updated FIR
        var updatedFir = await _firRepository.GetByIdAsync(dto.FirId);

        var response = MapToFirResponseDto(updatedFir!);

        return ServiceResult<FirResponseDto>.SuccessResult(
            response,
            $"FIR {updatedFir!.Firno} updated successfully.");
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private FirResponseDto MapToFirResponseDto(Fir fir)
    {
        return new FirResponseDto
        {
            FirId = fir.Firid,
            FirNo = fir.Firno ?? string.Empty,

            // Station
            StationId = fir.StationId ?? 0,
            StationName = fir.Station?.StationName ?? string.Empty,
            StationCode = fir.Station?.StationCode ?? string.Empty,

            // Challan
            ChallanId = fir.ChallanId ?? 0,
            AccusedName = fir.Challan?.Accused?.FullName ?? string.Empty,
            AccusedCnic = fir.Challan?.Accused?.Cnic ?? string.Empty,
            VehiclePlateNumber = fir.Challan?.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = fir.Challan?.Violation?.ViolationType ?? string.Empty,
            IsCognizable = fir.Challan?.Violation?.IsCognizable ?? false,
            PenaltyAmount = fir.Challan?.Violation?.PenaltyAmount ?? 0,

            // Emission Report
            EmissionReportId = fir.Challan?.EmissionReportId ?? 0,
            SoundLevelDBa = fir.Challan?.EmissionReport?.SoundLevelDBa ?? 0,
            MlClassification = fir.Challan?.EmissionReport?.MlClassification,
            DigitalSignatureValue = fir.Challan?.EmissionReport?.DigitalSignatureValue ?? string.Empty,

            // Informant
            InformantId = fir.InformantId ?? 0,
            InformantName = fir.Informant?.User?.FullName ?? string.Empty,
            InformantBadgeNumber = fir.Informant?.BadgeNumber ?? string.Empty,

            // FIR
            DateFiled = fir.DateFiled ?? DateTime.MinValue,
            FirDescription = fir.Firdescription ?? string.Empty,
            FirStatus = fir.Firstatus ?? string.Empty,
            InvestigationReport = fir.InvestigationReport,

            // Case
            HasCase = fir.Cases?.Any() ?? false,
            CaseId = fir.Cases?.FirstOrDefault()?.CaseId
        };
    }

    private FirListItemDto MapToFirListItemDto(Fir fir)
    {
        return new FirListItemDto
        {
            FirId = fir.Firid,
            FirNo = fir.Firno ?? string.Empty,
            StationName = fir.Station?.StationName ?? string.Empty,
            AccusedName = fir.Challan?.Accused?.FullName ?? string.Empty,
            VehiclePlateNumber = fir.Challan?.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = fir.Challan?.Violation?.ViolationType ?? string.Empty,
            DateFiled = fir.DateFiled ?? DateTime.MinValue,
            FirStatus = fir.Firstatus ?? string.Empty,
            HasCase = fir.Cases?.Any() ?? false
        };
    }
}