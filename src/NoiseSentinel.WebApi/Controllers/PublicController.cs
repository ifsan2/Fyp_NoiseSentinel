using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Public;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Public controller for case status check without authentication.
/// Allows accused persons to verify their identity via OTP and view their case details.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PublicController : ControllerBase
{
    private readonly IPublicStatusService _publicStatusService;
    private readonly ILogger<PublicController> _logger;

    public PublicController(
        IPublicStatusService publicStatusService,
        ILogger<PublicController> logger)
    {
        _publicStatusService = publicStatusService;
        _logger = logger;
    }

    /// <summary>
    /// Request an OTP for case status verification.
    /// The user must provide their vehicle number, CNIC, and registered email.
    /// </summary>
    /// <param name="dto">Request containing VehicleNo, Cnic, and Email</param>
    /// <returns>Success message with masked email if valid, error message otherwise</returns>
    [HttpPost("request-status-otp")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RequestStatusOtp([FromBody] RequestStatusOtpDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid request data",
                errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
            });
        }

        _logger.LogInformation("Public status OTP requested for vehicle {VehicleNo}", dto.VehicleNo);

        var result = await _publicStatusService.RequestStatusOtpAsync(dto);

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                data = result.Data
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Message
        });
    }

    /// <summary>
    /// Verify the OTP sent to the user's email.
    /// Returns an access token that can be used to retrieve case status.
    /// </summary>
    /// <param name="dto">Request containing VehicleNo, Cnic, Email, and OTP</param>
    /// <returns>Access token and expiration if valid, error message otherwise</returns>
    [HttpPost("verify-status-otp")]
    [ProducesResponseType(typeof(StatusOtpVerificationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyStatusOtp([FromBody] VerifyStatusOtpDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid request data",
                errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
            });
        }

        _logger.LogInformation("OTP verification attempted for vehicle {VehicleNo}", dto.VehicleNo);

        var result = await _publicStatusService.VerifyStatusOtpAsync(dto);

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Data?.Message,
                accessToken = result.Data?.AccessToken,
                expiresAt = result.Data?.ExpiresAt
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Message
        });
    }

    /// <summary>
    /// Get complete case status using the access token.
    /// Returns all challans, FIRs, cases, and statements for the verified user.
    /// </summary>
    /// <param name="token">Access token received after OTP verification</param>
    /// <returns>Complete case status including all related records</returns>
    [HttpGet("case-status")]
    [ProducesResponseType(typeof(PublicCaseStatusResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCaseStatus([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new
            {
                success = false,
                message = "Access token is required"
            });
        }

        _logger.LogInformation("Case status requested with token");

        var result = await _publicStatusService.GetCaseStatusAsync(token);

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = "Case status retrieved successfully",
                data = result.Data
            });
        }

        // Distinguish between invalid and expired tokens
        if (result.Message?.Contains("expired") == true)
        {
            return Unauthorized(new
            {
                success = false,
                message = result.Message
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Message
        });
    }

    /// <summary>
    /// Get a downloadable summary of case status in JSON format.
    /// </summary>
    /// <param name="token">Access token received after OTP verification</param>
    /// <returns>Downloadable JSON file with complete case status</returns>
    [HttpGet("case-status/download")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DownloadCaseStatus([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new
            {
                success = false,
                message = "Access token is required"
            });
        }

        var result = await _publicStatusService.GetCaseStatusAsync(token);

        if (!result.Success)
        {
            if (result.Message?.Contains("expired") == true)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = result.Message
                });
            }

            return BadRequest(new
            {
                success = false,
                message = result.Message
            });
        }

        var data = result.Data!;
        var fileName = $"CaseStatus_{data.VehiclePlateNumber}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";

        var json = System.Text.Json.JsonSerializer.Serialize(new
        {
            generatedAt = DateTime.UtcNow,
            accusedInformation = new
            {
                data.AccusedName,
                data.Cnic,
                data.Contact,
                data.Address,
                data.City,
                data.Province
            },
            vehicleInformation = new
            {
                plateNumber = data.VehiclePlateNumber,
                data.VehicleMake,
                data.VehicleColor,
                regYear = data.VehicleRegYear
            },
            summary = new
            {
                data.TotalChallans,
                data.UnpaidChallans,
                data.TotalFirs,
                data.ActiveCases,
                data.TotalPenaltyAmount,
                data.UnpaidPenaltyAmount
            },
            challans = data.Challans,
            firs = data.Firs,
            cases = data.Cases
        }, new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        });

        var bytes = System.Text.Encoding.UTF8.GetBytes(json);
        return File(bytes, "application/json", fileName);
    }
}
