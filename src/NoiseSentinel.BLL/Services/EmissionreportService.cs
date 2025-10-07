using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.EmissionReport;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for Emission Report management operations.
/// Includes digital signature generation for evidence integrity.
/// </summary>
public class EmissionreportService : IEmissionreportService
{
    private readonly IEmissionreportRepository _emissionreportRepository;
    private readonly IIotdeviceRepository _iotdeviceRepository;
    private readonly NoiseSentinelDbContext _context;

    public EmissionreportService(
        IEmissionreportRepository emissionreportRepository,
        IIotdeviceRepository iotdeviceRepository,
        NoiseSentinelDbContext context)
    {
        _emissionreportRepository = emissionreportRepository;
        _iotdeviceRepository = iotdeviceRepository;
        _context = context;
    }

    public async Task<ServiceResult<EmissionReportResponseDto>> CreateEmissionReportAsync(
        CreateEmissionReportDto dto, int officerUserId)
    {
        // Verify user is Police Officer
        var officer = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == officerUserId);

        if (officer?.Role?.RoleName != "Police Officer")
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                "Only Police Officers can create emission reports.");
        }

        // Validate device exists
        var device = await _iotdeviceRepository.GetByIdAsync(dto.DeviceId);
        if (device == null)
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                $"IoT Device with ID {dto.DeviceId} not found.");
        }

        // Validate device is registered
        if (device.IsRegistered != true)
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                $"Device '{device.DeviceName}' is not registered. Cannot create emission report.");
        }

        // Validate device is calibrated
        if (device.IsCalibrated != true)
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                $"Device '{device.DeviceName}' is not calibrated. Readings may be inaccurate.");
        }

        // Validate test date/time is not in future
        if (dto.TestDateTime > DateTime.UtcNow)
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                "Test date/time cannot be in the future.");
        }

        // Check for duplicate readings
        var isDuplicate = await _emissionreportRepository
            .CheckDuplicateReadingAsync(dto.DeviceId, dto.TestDateTime, 5);

        if (isDuplicate)
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                "A similar emission report was created less than 5 minutes ago. Possible duplicate detected.");
        }

        // Generate digital signature
        var digitalSignature = GenerateDigitalSignature(
            dto.DeviceId,
            dto.Co,
            dto.Co2,
            dto.Hc,
            dto.Nox,
            dto.SoundLevelDBa,
            dto.TestDateTime);

        // Create emission report
        var emissionReport = new Emissionreport
        {
            DeviceId = dto.DeviceId,
            Co = dto.Co,
            Co2 = dto.Co2,
            Hc = dto.Hc,
            Nox = dto.Nox,
            SoundLevelDBa = dto.SoundLevelDBa,
            TestDateTime = dto.TestDateTime,
            MlClassification = dto.MlClassification,
            DigitalSignatureValue = digitalSignature
        };

        var reportId = await _emissionreportRepository.CreateAsync(emissionReport);

        // Retrieve created report
        var createdReport = await _emissionreportRepository.GetByIdAsync(reportId);

        var isViolation = createdReport!.SoundLevelDBa > 85.0m;

        var response = new EmissionReportResponseDto
        {
            EmissionReportId = createdReport.EmissionReportId,
            DeviceId = createdReport.DeviceId ?? 0,
            DeviceName = createdReport.Device?.DeviceName ?? string.Empty,
            Co = createdReport.Co,
            Co2 = createdReport.Co2,
            Hc = createdReport.Hc,
            Nox = createdReport.Nox,
            SoundLevelDBa = createdReport.SoundLevelDBa ?? 0,
            TestDateTime = createdReport.TestDateTime ?? DateTime.MinValue,
            MlClassification = createdReport.MlClassification,
            DigitalSignatureValue = createdReport.DigitalSignatureValue ?? string.Empty,
            IsViolation = isViolation,
            LegalSoundLimit = 85.0m,
            HasChallan = createdReport.Challans?.Any() ?? false,
            ChallanId = createdReport.Challans?.FirstOrDefault()?.ChallanId
        };

        var message = isViolation
            ? $"⚠️ VIOLATION DETECTED! Sound level {dto.SoundLevelDBa} dBA exceeds legal limit of 85 dBA. " +
              $"Emission Report #{reportId} created successfully. Ready to create Challan."
            : $"Emission Report #{reportId} created successfully. No violation detected.";

        return ServiceResult<EmissionReportResponseDto>.SuccessResult(response, message);
    }

    public async Task<ServiceResult<EmissionReportResponseDto>> GetEmissionReportByIdAsync(int emissionReportId)
    {
        var report = await _emissionreportRepository.GetByIdAsync(emissionReportId);

        if (report == null)
        {
            return ServiceResult<EmissionReportResponseDto>.FailureResult(
                $"Emission Report with ID {emissionReportId} not found.");
        }

        var response = new EmissionReportResponseDto
        {
            EmissionReportId = report.EmissionReportId,
            DeviceId = report.DeviceId ?? 0,
            DeviceName = report.Device?.DeviceName ?? string.Empty,
            Co = report.Co,
            Co2 = report.Co2,
            Hc = report.Hc,
            Nox = report.Nox,
            SoundLevelDBa = report.SoundLevelDBa ?? 0,
            TestDateTime = report.TestDateTime ?? DateTime.MinValue,
            MlClassification = report.MlClassification,
            DigitalSignatureValue = report.DigitalSignatureValue ?? string.Empty,
            IsViolation = (report.SoundLevelDBa ?? 0) > 85.0m,
            LegalSoundLimit = 85.0m,
            HasChallan = report.Challans?.Any() ?? false,
            ChallanId = report.Challans?.FirstOrDefault()?.ChallanId
        };

        return ServiceResult<EmissionReportResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetAllEmissionReportsAsync()
    {
        var reports = await _emissionreportRepository.GetAllAsync();

        var response = reports.Select(r => new EmissionReportListItemDto
        {
            EmissionReportId = r.EmissionReportId,
            DeviceName = r.Device?.DeviceName ?? string.Empty,
            SoundLevelDBa = r.SoundLevelDBa ?? 0,
            TestDateTime = r.TestDateTime ?? DateTime.MinValue,
            MlClassification = r.MlClassification,
            IsViolation = (r.SoundLevelDBa ?? 0) > 85.0m,
            HasChallan = r.Challans?.Any() ?? false
        }).ToList();

        return ServiceResult<IEnumerable<EmissionReportListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetEmissionReportsByDeviceAsync(
        int deviceId)
    {
        var reports = await _emissionreportRepository.GetByDeviceAsync(deviceId);

        var response = reports.Select(r => new EmissionReportListItemDto
        {
            EmissionReportId = r.EmissionReportId,
            DeviceName = r.Device?.DeviceName ?? string.Empty,
            SoundLevelDBa = r.SoundLevelDBa ?? 0,
            TestDateTime = r.TestDateTime ?? DateTime.MinValue,
            MlClassification = r.MlClassification,
            IsViolation = (r.SoundLevelDBa ?? 0) > 85.0m,
            HasChallan = r.Challans?.Any() ?? false
        }).ToList();

        return ServiceResult<IEnumerable<EmissionReportListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetEmissionReportsByDateRangeAsync(
        DateTime startDate, DateTime endDate)
    {
        var reports = await _emissionreportRepository.GetByDateRangeAsync(startDate, endDate);

        var response = reports.Select(r => new EmissionReportListItemDto
        {
            EmissionReportId = r.EmissionReportId,
            DeviceName = r.Device?.DeviceName ?? string.Empty,
            SoundLevelDBa = r.SoundLevelDBa ?? 0,
            TestDateTime = r.TestDateTime ?? DateTime.MinValue,
            MlClassification = r.MlClassification,
            IsViolation = (r.SoundLevelDBa ?? 0) > 85.0m,
            HasChallan = r.Challans?.Any() ?? false
        }).ToList();

        return ServiceResult<IEnumerable<EmissionReportListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetViolationReportsAsync(
        decimal soundThreshold = 85.0m)
    {
        var reports = await _emissionreportRepository.GetViolationReportsAsync(soundThreshold);

        var response = reports.Select(r => new EmissionReportListItemDto
        {
            EmissionReportId = r.EmissionReportId,
            DeviceName = r.Device?.DeviceName ?? string.Empty,
            SoundLevelDBa = r.SoundLevelDBa ?? 0,
            TestDateTime = r.TestDateTime ?? DateTime.MinValue,
            MlClassification = r.MlClassification,
            IsViolation = true,
            HasChallan = r.Challans?.Any() ?? false
        }).ToList();

        return ServiceResult<IEnumerable<EmissionReportListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<EmissionReportListItemDto>>> GetReportsWithoutChallansAsync()
    {
        var reports = await _emissionreportRepository.GetReportsWithoutChallansAsync();

        var response = reports.Select(r => new EmissionReportListItemDto
        {
            EmissionReportId = r.EmissionReportId,
            DeviceName = r.Device?.DeviceName ?? string.Empty,
            SoundLevelDBa = r.SoundLevelDBa ?? 0,
            TestDateTime = r.TestDateTime ?? DateTime.MinValue,
            MlClassification = r.MlClassification,
            IsViolation = (r.SoundLevelDBa ?? 0) > 85.0m,
            HasChallan = false
        }).ToList();

        return ServiceResult<IEnumerable<EmissionReportListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<VerifyEmissionReportDto>> VerifyEmissionReportIntegrityAsync(
        int emissionReportId)
    {
        var report = await _emissionreportRepository.GetByIdAsync(emissionReportId);

        if (report == null)
        {
            return ServiceResult<VerifyEmissionReportDto>.FailureResult(
                $"Emission Report with ID {emissionReportId} not found.");
        }

        // Recompute digital signature
        var computedSignature = GenerateDigitalSignature(
            report.DeviceId ?? 0,
            report.Co,
            report.Co2,
            report.Hc,
            report.Nox,
            report.SoundLevelDBa ?? 0,
            report.TestDateTime ?? DateTime.MinValue);

        var storedSignature = report.DigitalSignatureValue ?? string.Empty;
        var isMatch = computedSignature == storedSignature;

        var response = new VerifyEmissionReportDto
        {
            EmissionReportId = emissionReportId,
            IsAuthentic = isMatch,
            DigitalSignatureMatch = isMatch,
            DataIntegrity = isMatch ? "Intact - No tampering detected" : "⚠️ COMPROMISED - Data has been modified",
            StoredSignature = storedSignature,
            ComputedSignature = computedSignature,
            VerifiedAt = DateTime.UtcNow,
            AdmissibleInCourt = isMatch,
            VerificationMessage = isMatch
                ? "✅ Emission report is authentic and has not been tampered with. Admissible as court evidence."
                : "❌ WARNING: Emission report integrity compromised. NOT admissible as court evidence."
        };

        return ServiceResult<VerifyEmissionReportDto>.SuccessResult(response);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /// <summary>
    /// Generate SHA256 digital signature for emission report data.
    /// </summary>
    private string GenerateDigitalSignature(
        int deviceId,
        decimal? co,
        decimal? co2,
        decimal? hc,
        decimal? nox,
        decimal soundLevelDBa,
        DateTime testDateTime)
    {
        // Construct data string for hashing
        var dataToSign = $"{deviceId}|" +
                        $"{co?.ToString("F2") ?? "NULL"}|" +
                        $"{co2?.ToString("F2") ?? "NULL"}|" +
                        $"{hc?.ToString("F2") ?? "NULL"}|" +
                        $"{nox?.ToString("F2") ?? "NULL"}|" +
                        $"{soundLevelDBa:F2}|" +
                        $"{testDateTime:O}";  // ISO 8601 format

        // Compute SHA256 hash
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(dataToSign));

        // Convert to Base64 string
        return Convert.ToBase64String(hashBytes);
    }
}