using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Public;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for public status check operations.
/// </summary>
public class PublicStatusService : IPublicStatusService
{
    private readonly NoiseSentinelDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<PublicStatusService> _logger;

    private const int OTP_EXPIRATION_MINUTES = 15;
    private const int ACCESS_TOKEN_EXPIRATION_HOURS = 24;

    public PublicStatusService(
        NoiseSentinelDbContext context,
        IEmailService emailService,
        ILogger<PublicStatusService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ServiceResult<string>> RequestStatusOtpAsync(RequestStatusOtpDto dto)
    {
        // ========================================================================
        // STEP 1: VALIDATE VEHICLE, CNIC, AND EMAIL MATCH
        // ========================================================================

        // Find the accused with matching CNIC and email
        var accused = await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
            .FirstOrDefaultAsync(a => 
                a.Cnic == dto.Cnic && 
                a.Email != null && 
                a.Email.ToLower() == dto.Email.ToLower());

        if (accused == null)
        {
            return ServiceResult<string>.FailureResult(
                "No records found matching the provided CNIC and email combination. " +
                "Please ensure you have provided the correct email address registered with your records.");
        }

        // Check if the vehicle belongs to this accused
        var vehicleMatch = accused.Vehicles?.Any(v => 
            v.PlateNumber != null && 
            v.PlateNumber.Replace(" ", "").Replace("-", "").ToUpper() == 
            dto.VehicleNo.Replace(" ", "").Replace("-", "").ToUpper()) ?? false;

        // Also check challans if vehicle not directly owned
        if (!vehicleMatch)
        {
            var challanWithVehicle = await _context.Challans
                .Include(c => c.Vehicle)
                .AnyAsync(c => 
                    c.AccusedId == accused.AccusedId && 
                    c.Vehicle != null && 
                    c.Vehicle.PlateNumber != null &&
                    c.Vehicle.PlateNumber.Replace(" ", "").Replace("-", "").ToUpper() == 
                    dto.VehicleNo.Replace(" ", "").Replace("-", "").ToUpper());

            if (!challanWithVehicle)
            {
                return ServiceResult<string>.FailureResult(
                    "No records found for the provided vehicle number with your CNIC. " +
                    "Please check the vehicle registration number.");
            }
        }

        // ========================================================================
        // STEP 2: GENERATE AND STORE OTP
        // ========================================================================

        // Invalidate any existing OTPs for this combination
        var existingOtps = await _context.PublicStatusOtps
            .Where(o => o.VehicleNo == dto.VehicleNo && o.Cnic == dto.Cnic && o.Email == dto.Email && !o.IsVerified)
            .ToListAsync();

        _context.PublicStatusOtps.RemoveRange(existingOtps);

        // Generate new OTP
        var otp = GenerateOtp();

        var publicStatusOtp = new PublicStatusOtp
        {
            VehicleNo = dto.VehicleNo,
            Cnic = dto.Cnic,
            Email = dto.Email,
            OtpCode = otp,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OTP_EXPIRATION_MINUTES),
            IsVerified = false
        };

        _context.PublicStatusOtps.Add(publicStatusOtp);
        await _context.SaveChangesAsync();

        // ========================================================================
        // STEP 3: SEND OTP EMAIL
        // ========================================================================

        try
        {
            await _emailService.SendPublicStatusOtpEmailAsync(
                toEmail: dto.Email,
                accusedName: accused.FullName ?? "Sir/Madam",
                otp: otp,
                vehicleNo: dto.VehicleNo
            );

            _logger.LogInformation("Public status OTP sent to {Email} for vehicle {VehicleNo}", dto.Email, dto.VehicleNo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send public status OTP email to {Email}", dto.Email);
            return ServiceResult<string>.FailureResult(
                "Failed to send OTP email. Please try again later.");
        }

        return ServiceResult<string>.SuccessResult(
            "OTP sent successfully",
            $"A 6-digit verification code has been sent to {MaskEmail(dto.Email)}. " +
            $"The code is valid for {OTP_EXPIRATION_MINUTES} minutes.");
    }

    public async Task<ServiceResult<StatusOtpVerificationResponseDto>> VerifyStatusOtpAsync(VerifyStatusOtpDto dto)
    {
        // ========================================================================
        // STEP 1: FIND AND VALIDATE OTP
        // ========================================================================

        var otpRecord = await _context.PublicStatusOtps
            .FirstOrDefaultAsync(o => 
                o.VehicleNo == dto.VehicleNo && 
                o.Cnic == dto.Cnic && 
                o.Email.ToLower() == dto.Email.ToLower() &&
                o.OtpCode == dto.Otp &&
                !o.IsVerified);

        if (otpRecord == null)
        {
            return ServiceResult<StatusOtpVerificationResponseDto>.FailureResult(
                "Invalid OTP. Please check the code and try again.");
        }

        // Check expiration
        if (otpRecord.ExpiresAt < DateTime.UtcNow)
        {
            return ServiceResult<StatusOtpVerificationResponseDto>.FailureResult(
                "OTP has expired. Please request a new code.");
        }

        // ========================================================================
        // STEP 2: GENERATE ACCESS TOKEN
        // ========================================================================

        var accessToken = GenerateAccessToken();
        var expiresAt = DateTime.UtcNow.AddHours(ACCESS_TOKEN_EXPIRATION_HOURS);

        otpRecord.IsVerified = true;
        otpRecord.AccessToken = accessToken;
        otpRecord.AccessTokenExpiresAt = expiresAt;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Public status OTP verified for {Email}, access token generated", dto.Email);

        var response = new StatusOtpVerificationResponseDto
        {
            Success = true,
            Message = "OTP verified successfully. You can now view your case status.",
            AccessToken = accessToken,
            ExpiresAt = expiresAt
        };

        return ServiceResult<StatusOtpVerificationResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<PublicCaseStatusResponseDto>> GetCaseStatusAsync(string accessToken)
    {
        // ========================================================================
        // STEP 1: VALIDATE ACCESS TOKEN
        // ========================================================================

        var otpRecord = await _context.PublicStatusOtps
            .FirstOrDefaultAsync(o => o.AccessToken == accessToken && o.IsVerified);

        if (otpRecord == null)
        {
            return ServiceResult<PublicCaseStatusResponseDto>.FailureResult(
                "Invalid access token. Please verify your identity again.");
        }

        if (otpRecord.AccessTokenExpiresAt < DateTime.UtcNow)
        {
            return ServiceResult<PublicCaseStatusResponseDto>.FailureResult(
                "Access token has expired. Please verify your identity again.");
        }

        // ========================================================================
        // STEP 2: GET ACCUSED AND RELATED DATA
        // ========================================================================

        var accused = await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Violation)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Vehicle)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Officer)
                    .ThenInclude(o => o!.Station)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Firs)
                    .ThenInclude(f => f.Station)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Firs)
                    .ThenInclude(f => f.Cases)
                        .ThenInclude(ca => ca.Judge)
                            .ThenInclude(j => j!.User)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Firs)
                    .ThenInclude(f => f.Cases)
                        .ThenInclude(ca => ca.Judge)
                            .ThenInclude(j => j!.Court)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Firs)
                    .ThenInclude(f => f.Cases)
                        .ThenInclude(ca => ca.Casestatements)
            .FirstOrDefaultAsync(a => a.Cnic == otpRecord.Cnic && a.Email == otpRecord.Email);

        if (accused == null)
        {
            return ServiceResult<PublicCaseStatusResponseDto>.FailureResult(
                "No records found for your account.");
        }

        // ========================================================================
        // STEP 3: MAP DATA TO RESPONSE
        // ========================================================================

        // Get vehicle info (from ownership or challans)
        var vehicle = accused.Vehicles?.FirstOrDefault(v => 
            v.PlateNumber?.Replace(" ", "").Replace("-", "").ToUpper() == 
            otpRecord.VehicleNo.Replace(" ", "").Replace("-", "").ToUpper());

        if (vehicle == null)
        {
            vehicle = accused.Challans?.FirstOrDefault(c => 
                c.Vehicle?.PlateNumber?.Replace(" ", "").Replace("-", "").ToUpper() == 
                otpRecord.VehicleNo.Replace(" ", "").Replace("-", "").ToUpper())?.Vehicle;
        }

        var challans = accused.Challans?
            .Where(c => c.Vehicle?.PlateNumber?.Replace(" ", "").Replace("-", "").ToUpper() == 
                otpRecord.VehicleNo.Replace(" ", "").Replace("-", "").ToUpper())
            .ToList() ?? new List<Challan>();

        var response = new PublicCaseStatusResponseDto
        {
            // Accused Information
            AccusedName = accused.FullName ?? string.Empty,
            Cnic = accused.Cnic ?? string.Empty,
            Contact = accused.Contact,
            Address = accused.Address,
            City = accused.City,
            Province = accused.Province,

            // Vehicle Information
            VehiclePlateNumber = vehicle?.PlateNumber ?? otpRecord.VehicleNo,
            VehicleMake = vehicle?.Make,
            VehicleColor = vehicle?.Color,
            VehicleRegYear = vehicle?.VehRegYear,

            // Summary Statistics
            TotalChallans = challans.Count,
            UnpaidChallans = challans.Count(c => c.Status?.ToLower() == "unpaid"),
            TotalFirs = challans.SelectMany(c => c.Firs ?? Enumerable.Empty<Fir>()).Count(),
            ActiveCases = challans.SelectMany(c => c.Firs ?? Enumerable.Empty<Fir>())
                .SelectMany(f => f.Cases ?? Enumerable.Empty<Case>())
                .Count(ca => ca.CaseStatus?.ToLower() == "pending" || ca.CaseStatus?.ToLower() == "in progress"),
            TotalPenaltyAmount = challans.Sum(c => c.Violation?.PenaltyAmount ?? 0),
            UnpaidPenaltyAmount = challans.Where(c => c.Status?.ToLower() == "unpaid")
                .Sum(c => c.Violation?.PenaltyAmount ?? 0),

            // Detailed Records
            Challans = challans.Select(c => new PublicChallanDto
            {
                ChallanId = c.ChallanId,
                ViolationType = c.Violation?.ViolationType ?? "N/A",
                PenaltyAmount = c.Violation?.PenaltyAmount ?? 0,
                Status = c.Status ?? "Unknown",
                IssueDateTime = c.IssueDateTime ?? DateTime.MinValue,
                DueDateTime = c.DueDateTime ?? DateTime.MinValue,
                StationName = c.Officer?.Station?.StationName ?? "N/A",
                IsCognizable = c.Violation?.IsCognizable ?? false,
                HasFir = c.Firs?.Any() ?? false,
                IsOverdue = c.DueDateTime < DateTime.UtcNow && c.Status?.ToLower() == "unpaid"
            }).OrderByDescending(c => c.IssueDateTime).ToList(),

            Firs = challans.SelectMany(c => c.Firs ?? Enumerable.Empty<Fir>())
                .Select(f => new PublicFirDto
                {
                    FirId = f.Firid,
                    FirNo = f.Firno ?? "N/A",
                    DateFiled = f.DateFiled ?? DateTime.MinValue,
                    Status = f.Firstatus ?? "Unknown",
                    StationName = f.Station?.StationName ?? "N/A",
                    RelatedChallanId = f.ChallanId ?? 0,
                    HasCase = f.Cases?.Any() ?? false
                }).OrderByDescending(f => f.DateFiled).ToList(),

            Cases = challans.SelectMany(c => c.Firs ?? Enumerable.Empty<Fir>())
                .SelectMany(f => f.Cases ?? Enumerable.Empty<Case>())
                .Select(ca => new PublicCaseDto
                {
                    CaseId = ca.CaseId,
                    CaseNo = ca.CaseNo ?? "N/A",
                    CaseType = ca.CaseType ?? "N/A",
                    CaseStatus = ca.CaseStatus ?? "Unknown",
                    HearingDate = ca.HearingDate,
                    Verdict = ca.Verdict,
                    CourtName = ca.Judge?.Court?.CourtName ?? "N/A",
                    JudgeName = ca.Judge?.User?.FullName ?? "N/A",
                    FirNo = ca.Fir?.Firno ?? "N/A",
                    Statements = ca.Casestatements?.Select(s => new PublicCaseStatementDto
                    {
                        StatementId = s.StatementId,
                        StatementBy = s.StatementBy ?? "N/A",
                        StatementText = s.StatementText ?? string.Empty,
                        StatementDate = s.StatementDate ?? DateTime.MinValue
                    }).OrderByDescending(s => s.StatementDate).ToList() ?? new List<PublicCaseStatementDto>()
                }).OrderByDescending(ca => ca.HearingDate).ToList()
        };

        return ServiceResult<PublicCaseStatusResponseDto>.SuccessResult(response);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private static string GenerateOtp()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var number = BitConverter.ToUInt32(bytes, 0) % 1000000;
        return number.ToString("D6");
    }

    private static string GenerateAccessToken()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[32];
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return email;

        var localPart = parts[0];
        var domain = parts[1];

        if (localPart.Length <= 2)
            return $"{localPart}***@{domain}";

        return $"{localPart[0]}***{localPart[^1]}@{domain}";
    }
}
