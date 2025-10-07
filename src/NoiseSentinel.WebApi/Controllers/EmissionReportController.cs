using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.EmissionReport;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Emission Report Management Controller.
/// Handles IoT device emission readings with digital signature protection.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EmissionReportController : ControllerBase
{
    private readonly IEmissionreportService _emissionreportService;
    private readonly ILogger<EmissionReportController> _logger;

    public EmissionReportController(
        IEmissionreportService emissionreportService,
        ILogger<EmissionReportController> logger)
    {
        _emissionreportService = emissionreportService;
        _logger = logger;
    }

    // ========================================================================
    // EMISSION REPORT CREATION (IMMUTABLE)
    // ========================================================================

    /// <summary>
    /// Create emission report from IoT device reading (Police Officer only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer role
    /// 
    /// **IMPORTANT:** Once created, emission reports are IMMUTABLE (cannot be modified).
    /// Digital signature is auto-generated for integrity protection.
    /// 
    /// Sample request:
    /// 
    ///     POST /api/emissionreport/create
    ///     Authorization: Bearer {police-officer-token}
    ///     {
    ///         "deviceId": 1,
    ///         "co": 150.5,
    ///         "co2": 250.2,
    ///         "hc": 80.3,
    ///         "nox": 120.1,
    ///         "soundLevelDBa": 95.5,
    ///         "testDateTime": "2025-10-07T11:39:03Z",
    ///         "mlClassification": "Modified Silencer Detected"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Emission report data from IoT device</param>
    /// <returns>Created emission report with digital signature</returns>
    /// <response code="200">Emission report created successfully</response>
    /// <response code="400">Validation failed or device not calibrated</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Police Officers can create reports</response>
    [HttpPost("create")]
    [Authorize(Policy = "PoliceOfficerOnly")]
    [ProducesResponseType(typeof(EmissionReportResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateEmissionReport([FromBody] CreateEmissionReportDto dto)
    {
        var officerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Emission report creation attempt by Police Officer {OfficerId} using Device {DeviceId}",
            officerUserId, dto.DeviceId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _emissionreportService.CreateEmissionReportAsync(dto, officerUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Emission report creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Emission report created successfully: {EmissionReportId}, Violation: {IsViolation}",
            result.Data?.EmissionReportId, result.Data?.IsViolation);

        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    // ========================================================================
    // EMISSION REPORT RETRIEVAL
    // ========================================================================

    /// <summary>
    /// Get emission report by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer, Station Authority, Court Authority, Judge
    /// 
    /// Returns detailed emission report with digital signature.
    /// </remarks>
    /// <param name="id">Emission report ID</param>
    /// <returns>Emission report details</returns>
    /// <response code="200">Returns emission report details</response>
    /// <response code="404">Emission report not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")]
    [ProducesResponseType(typeof(EmissionReportResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetEmissionReportById(int id)
    {
        var result = await _emissionreportService.GetEmissionReportByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Emission report retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all emission reports (Station Authority).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns list of all emission reports.
    /// </remarks>
    /// <returns>List of emission reports</returns>
    /// <response code="200">Returns list of emission reports</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(EmissionReportListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllEmissionReports()
    {
        var result = await _emissionreportService.GetAllEmissionReportsAsync();

        return Ok(new
        {
            message = "Emission reports retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get emission reports by device.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns all emission reports from a specific IoT device.
    /// 
    /// Sample: GET /api/emissionreport/device/1
    /// </remarks>
    /// <param name="deviceId">Device ID</param>
    /// <returns>List of emission reports for device</returns>
    /// <response code="200">Returns emission reports</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("device/{deviceId}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(EmissionReportListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetEmissionReportsByDevice(int deviceId)
    {
        var result = await _emissionreportService.GetEmissionReportsByDeviceAsync(deviceId);

        return Ok(new
        {
            message = $"Emission reports for device {deviceId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get emission reports by date range.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Sample: GET /api/emissionreport/daterange?startDate=2025-10-01&endDate=2025-10-07
    /// </remarks>
    /// <param name="startDate">Start date (UTC)</param>
    /// <param name="endDate">End date (UTC)</param>
    /// <returns>List of emission reports in date range</returns>
    /// <response code="200">Returns emission reports</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("daterange")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(EmissionReportListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetEmissionReportsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await _emissionreportService.GetEmissionReportsByDateRangeAsync(startDate, endDate);

        return Ok(new
        {
            message = $"Emission reports from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get violation reports (sound level exceeds threshold).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns reports where sound level exceeds legal limit.
    /// Default threshold: 85 dBA
    /// 
    /// Sample: GET /api/emissionreport/violations?threshold=85
    /// </remarks>
    /// <param name="threshold">Sound level threshold (default: 85 dBA)</param>
    /// <returns>List of violation reports</returns>
    /// <response code="200">Returns violation reports</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("violations")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(EmissionReportListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetViolationReports([FromQuery] decimal threshold = 85.0m)
    {
        var result = await _emissionreportService.GetViolationReportsAsync(threshold);

        return Ok(new
        {
            message = $"Violation reports (sound level > {threshold} dBA) retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get reports without challans (pending action).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns emission reports that don't have challans issued yet.
    /// Useful for identifying pending violations.
    /// </remarks>
    /// <returns>List of reports without challans</returns>
    /// <response code="200">Returns reports without challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("pending-challans")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(EmissionReportListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetReportsWithoutChallans()
    {
        var result = await _emissionreportService.GetReportsWithoutChallansAsync();

        return Ok(new
        {
            message = "Emission reports without challans retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data,
            action = "These reports are pending challan creation"
        });
    }

    // ========================================================================
    // INTEGRITY VERIFICATION
    // ========================================================================

    /// <summary>
    /// Verify emission report integrity (digital signature check).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority, Judge
    /// 
    /// Verifies that emission report has not been tampered with.
    /// Compares stored digital signature with recomputed signature.
    /// Used as court evidence verification.
    /// 
    /// Sample: GET /api/emissionreport/1/verify
    /// </remarks>
    /// <param name="id">Emission report ID</param>
    /// <returns>Verification result</returns>
    /// <response code="200">Returns verification result</response>
    /// <response code="404">Emission report not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}/verify")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(VerifyEmissionReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifyEmissionReportIntegrity(int id)
    {
        _logger.LogInformation("Emission report integrity verification requested for Report {EmissionReportId} by User {UserId}",
            id, User.FindFirstValue(ClaimTypes.NameIdentifier));

        var result = await _emissionreportService.VerifyEmissionReportIntegrityAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Emission report integrity verification completed",
            data = result.Data
        });
    }
}