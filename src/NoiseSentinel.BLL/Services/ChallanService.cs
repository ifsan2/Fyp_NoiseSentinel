using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Challan;
using NoiseSentinel.BLL.Helpers;
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
/// Service implementation for Challan management operations.
/// Includes auto-creation logic for Vehicle and Accused.
/// </summary>
public class ChallanService : IChallanService
{
    private readonly IChallanRepository _challanRepository;
    private readonly IViolationRepository _violationRepository;
    private readonly IEmissionreportRepository _emissionreportRepository;
    private readonly IVehicleService _vehicleService;
    private readonly IAccusedService _accusedService;
    private readonly IPoliceofficerRepository _policeofficerRepository;
    private readonly NoiseSentinelDbContext _context;

    public ChallanService(
        IChallanRepository challanRepository,
        IViolationRepository violationRepository,
        IEmissionreportRepository emissionreportRepository,
        IVehicleService vehicleService,
        IAccusedService accusedService,
        IPoliceofficerRepository policeofficerRepository,
        NoiseSentinelDbContext context)
    {
        _challanRepository = challanRepository;
        _violationRepository = violationRepository;
        _emissionreportRepository = emissionreportRepository;
        _vehicleService = vehicleService;
        _accusedService = accusedService;
        _policeofficerRepository = policeofficerRepository;
        _context = context;
    }

    public async Task<ServiceResult<ChallanResponseDto>> CreateChallanAsync(
    CreateChallanDto dto, int officerUserId)
    {
        // ========================================================================
        // STEP 1: VERIFY OFFICER
        // ========================================================================

        var officer = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == officerUserId);

        if (officer?.Role?.RoleName != "Police Officer")
        {
            return ServiceResult<ChallanResponseDto>.FailureResult(
                "Only Police Officers can create challans.");
        }

        // Get Policeofficer by UserId (query the Policeofficers table directly)
        var policeofficer = await _context.Policeofficers
            .Include(p => p.Station)
            .FirstOrDefaultAsync(p => p.UserId == officerUserId);

        if (policeofficer == null)
        {
            return ServiceResult<ChallanResponseDto>.FailureResult(
                "Police Officer record not found for this user.");
        }

        // ========================================================================
        // STEP 2: VALIDATE VIOLATION
        // ========================================================================

        var violation = await _violationRepository.GetByIdAsync(dto.ViolationId);
        if (violation == null)
        {
            return ServiceResult<ChallanResponseDto>.FailureResult(
                $"Violation with ID {dto.ViolationId} not found.");
        }

        // ========================================================================
        // STEP 3: VALIDATE EMISSION REPORT (OPTIONAL)
        // ========================================================================

        int? emissionReportId = dto.EmissionReportId;
        string? digitalSignatureValue = null;

        if (dto.EmissionReportId.HasValue)
        {
            var emissionReport = await _emissionreportRepository.GetByIdAsync(dto.EmissionReportId.Value);
            if (emissionReport == null)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Emission Report with ID {dto.EmissionReportId.Value} not found.");
            }

            // Check if emission report already has a challan
            var reportHasChallan = await _challanRepository.EmissionReportHasChallanAsync(dto.EmissionReportId.Value);
            if (reportHasChallan)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Emission Report #{dto.EmissionReportId.Value} already has a challan. " +
                    "Each emission report can only have one challan.");
            }

            digitalSignatureValue = emissionReport.DigitalSignatureValue;
        }

        // ========================================================================
        // STEP 4: HANDLE VEHICLE (GET OR CREATE)
        // ========================================================================

        int vehicleId;

        if (dto.VehicleId.HasValue)
        {
            // Use existing vehicle
            vehicleId = dto.VehicleId.Value;

            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.VehicleId == vehicleId);
            if (!vehicleExists)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Vehicle with ID {vehicleId} not found.");
            }
        }
        else if (dto.VehicleInput != null)
        {
            // Auto-create vehicle
            var vehicleResult = await _vehicleService.GetOrCreateVehicleAsync(dto.VehicleInput);
            if (!vehicleResult.Success || vehicleResult.Data == null)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Failed to create/get vehicle: {vehicleResult.Message}");
            }
            vehicleId = vehicleResult.Data.VehicleId;
        }
        else
        {
            return ServiceResult<ChallanResponseDto>.FailureResult(
                "Either VehicleId or VehicleInput must be provided.");
        }

        // ========================================================================
        // STEP 5: HANDLE ACCUSED (GET OR CREATE)
        // ========================================================================

        int accusedId;

        if (dto.AccusedId.HasValue)
        {
            // Use existing accused
            accusedId = dto.AccusedId.Value;

            var accusedExists = await _context.Accuseds.AnyAsync(a => a.AccusedId == accusedId);
            if (!accusedExists)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Accused with ID {accusedId} not found.");
            }
        }
        else if (dto.AccusedInput != null)
        {
            // Auto-create accused
            var accusedResult = await _accusedService.GetOrCreateAccusedAsync(dto.AccusedInput);
            if (!accusedResult.Success || accusedResult.Data == null)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Failed to create/get accused: {accusedResult.Message}");
            }
            accusedId = accusedResult.Data.AccusedId;
        }
        else
        {
            return ServiceResult<ChallanResponseDto>.FailureResult(
                "Either AccusedId or AccusedInput must be provided.");
        }

        // ========================================================================
        // STEP 6: LINK VEHICLE TO ACCUSED (IF NOT ALREADY LINKED)
        // ========================================================================

        var vehicle = await _context.Vehicles.FindAsync(vehicleId);
        if (vehicle != null && vehicle.OwnerId == null)
        {
            vehicle.OwnerId = accusedId;
            await _context.SaveChangesAsync();
        }

        // ========================================================================
        // STEP 7: COMPRESS EVIDENCE IMAGE (IF PROVIDED)
        // ========================================================================

        string? compressedEvidencePath = null;
        if (!string.IsNullOrEmpty(dto.EvidencePath))
        {
            try
            {
                // Compress the base64 image data
                compressedEvidencePath = ImageCompressionHelper.CompressImage(dto.EvidencePath);
            }
            catch (Exception ex)
            {
                return ServiceResult<ChallanResponseDto>.FailureResult(
                    $"Failed to compress evidence image: {ex.Message}");
            }
        }

        // ========================================================================
        // STEP 8: CREATE CHALLAN
        // ========================================================================

        var issueDateTime = DateTime.UtcNow;
        var dueDateTime = issueDateTime.AddDays(30);  // 30 days to pay

        var challan = new Challan
        {
            OfficerId = policeofficer.OfficerId,
            AccusedId = accusedId,
            VehicleId = vehicleId,
            ViolationId = dto.ViolationId,
            EmissionReportId = emissionReportId,
            EvidencePath = compressedEvidencePath,
            IssueDateTime = issueDateTime,
            DueDateTime = dueDateTime,
            Status = "Unpaid",
            BankDetails = dto.BankDetails ?? "Account: XXXXXXXXXX, Bank: HBL",
            DigitalSignatureValue = digitalSignatureValue
        };

        var challanId = await _challanRepository.CreateAsync(challan);

        // ========================================================================
        // STEP 9: RETRIEVE AND MAP RESPONSE
        // ========================================================================

        var createdChallan = await _challanRepository.GetByIdAsync(challanId);

        var response = MapToChallanResponseDto(createdChallan!);

        var message = violation.IsCognizable == true
            ? $"⚠️ COGNIZABLE VIOLATION - Challan #{challanId} created successfully. " +
              $"This violation is cognizable and eligible for FIR filing by Station Authority."
            : $"✅ Challan #{challanId} created successfully. Due date: {dueDateTime:yyyy-MM-dd}.";

        return ServiceResult<ChallanResponseDto>.SuccessResult(response, message);
    }

    public async Task<ServiceResult<ChallanResponseDto>> GetChallanByIdAsync(int challanId)
    {
        var challan = await _challanRepository.GetByIdAsync(challanId);

        if (challan == null)
        {
            return ServiceResult<ChallanResponseDto>.FailureResult(
                $"Challan with ID {challanId} not found.");
        }

        var response = MapToChallanResponseDto(challan);

        return ServiceResult<ChallanResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByOfficerAsync(int officerId)
    {
        var challans = await _challanRepository.GetByOfficerAsync(officerId);

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetAllChallansAsync()
    {
        var challans = await _challanRepository.GetAllAsync();

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByStationAsync(int stationId)
    {
        var challans = await _challanRepository.GetByStationAsync(stationId);

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByVehicleAsync(int vehicleId)
    {
        var challans = await _challanRepository.GetByVehicleAsync(vehicleId);

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByAccusedAsync(int accusedId)
    {
        var challans = await _challanRepository.GetByAccusedAsync(accusedId);

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByStatusAsync(string status)
    {
        var challans = await _challanRepository.GetByStatusAsync(status);

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByDateRangeAsync(
        DateTime startDate, DateTime endDate)
    {
        var challans = await _challanRepository.GetByDateRangeAsync(startDate, endDate);

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetOverdueChallansAsync()
    {
        var challans = await _challanRepository.GetOverdueChallansAsync();

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ChallanListItemDto>>> SearchChallansByPlateAndCnicAsync(
        string plateNumber, string cnic)
    {
        var challans = await _challanRepository.GetByVehiclePlateAndCnicAsync(plateNumber, cnic);

        if (!challans.Any())
        {
            return ServiceResult<IEnumerable<ChallanListItemDto>>.FailureResult(
                $"No challans found for vehicle plate number '{plateNumber}' and CNIC '{cnic}'.");
        }

        var response = challans.Select(MapToChallanListItemDto).ToList();

        return ServiceResult<IEnumerable<ChallanListItemDto>>.SuccessResult(
            response,
            $"Found {response.Count} challan(s) for vehicle '{plateNumber}' and CNIC '{cnic}'.");
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private ChallanResponseDto MapToChallanResponseDto(Challan challan)
    {
        return new ChallanResponseDto
        {
            ChallanId = challan.ChallanId,

            // Officer
            OfficerId = challan.OfficerId ?? 0,
            OfficerName = challan.Officer?.User?.FullName ?? string.Empty,
            OfficerBadgeNumber = challan.Officer?.BadgeNumber ?? string.Empty,
            StationName = challan.Officer?.Station?.StationName ?? string.Empty,

            // Accused
            AccusedId = challan.AccusedId ?? 0,
            AccusedName = challan.Accused?.FullName ?? string.Empty,
            AccusedCnic = challan.Accused?.Cnic ?? string.Empty,
            AccusedContact = challan.Accused?.Contact,

            // Vehicle
            VehicleId = challan.VehicleId ?? 0,
            VehiclePlateNumber = challan.Vehicle?.PlateNumber ?? string.Empty,
            VehicleMake = challan.Vehicle?.Make,
            VehicleColor = challan.Vehicle?.Color,

            // Violation
            ViolationId = challan.ViolationId ?? 0,
            ViolationType = challan.Violation?.ViolationType ?? string.Empty,
            PenaltyAmount = challan.Violation?.PenaltyAmount ?? 0,
            IsCognizable = challan.Violation?.IsCognizable ?? false,

            // Emission Report (optional)
            EmissionReportId = challan.EmissionReportId,
            DeviceName = challan.EmissionReport?.Device?.DeviceName,
            SoundLevelDBa = challan.EmissionReport?.SoundLevelDBa,
            MlClassification = challan.EmissionReport?.MlClassification,
            EmissionTestDateTime = challan.EmissionReport?.TestDateTime,

            // Challan - Decompress evidence image for response
            EvidencePath = DecompressEvidenceImage(challan.EvidencePath),
            IssueDateTime = challan.IssueDateTime ?? DateTime.MinValue,
            DueDateTime = challan.DueDateTime ?? DateTime.MinValue,
            Status = challan.Status ?? string.Empty,
            BankDetails = challan.BankDetails,
            DigitalSignatureValue = challan.DigitalSignatureValue ?? string.Empty,

            // FIR
            HasFir = challan.Firs?.Any() ?? false,
            FirId = challan.Firs?.FirstOrDefault()?.Firid
        };
    }

    private ChallanListItemDto MapToChallanListItemDto(Challan challan)
    {
        var isOverdue = challan.DueDateTime < DateTime.UtcNow &&
                       challan.Status?.ToLower() == "unpaid";

        return new ChallanListItemDto
        {
            ChallanId = challan.ChallanId,
            OfficerName = challan.Officer?.User?.FullName ?? string.Empty,
            OfficerBadgeNumber = challan.Officer?.BadgeNumber,
            OfficerRank = challan.Officer?.Rank,
            AccusedName = challan.Accused?.FullName ?? string.Empty,
            AccusedCnic = challan.Accused?.Cnic ?? string.Empty,
            VehiclePlateNumber = challan.Vehicle?.PlateNumber ?? string.Empty,
            ViolationType = challan.Violation?.ViolationType ?? string.Empty,
            PenaltyAmount = challan.Violation?.PenaltyAmount ?? 0,
            IssueDateTime = challan.IssueDateTime ?? DateTime.MinValue,
            DueDateTime = challan.DueDateTime ?? DateTime.MinValue,
            Status = challan.Status ?? string.Empty,
            StationName = challan.Officer?.Station?.StationName ?? string.Empty,
            EvidencePath = DecompressEvidenceImage(challan.EvidencePath),
            IsOverdue = isOverdue,
            HasFir = challan.Firs?.Any() ?? false
        };
    }

    /// <summary>
    /// Helper method to safely decompress evidence image.
    /// Returns decompressed base64 image or null if compression fails.
    /// </summary>
    private string? DecompressEvidenceImage(string? compressedEvidencePath)
    {
        if (string.IsNullOrEmpty(compressedEvidencePath))
            return null;

        try
        {
            return ImageCompressionHelper.DecompressImage(compressedEvidencePath);
        }
        catch
        {
            // If decompression fails, return the original value (might be uncompressed legacy data)
            return compressedEvidencePath;
        }
    }
}