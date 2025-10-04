using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Policestation;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Police Station Management Controller.
/// Handles CRUD operations for police stations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PolicestationController : ControllerBase
{
    private readonly IPolicestationService _policestationService;
    private readonly ILogger<PolicestationController> _logger;

    public PolicestationController(
        IPolicestationService policestationService,
        ILogger<PolicestationController> logger)
    {
        _policestationService = policestationService;
        _logger = logger;
    }

    // ========================================================================
    // POLICE STATION CRUD ENDPOINTS
    // ========================================================================

    /// <summary>
    /// Create a new police station (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     POST /api/policestation/create
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "stationName": "Lahore Cantonment Police Station",
    ///         "stationCode": "LHR-CANT-001",
    ///         "location": "Mall Road, Cantonment",
    ///         "district": "Lahore",
    ///         "province": "Punjab",
    ///         "contact": "+92-42-1234567"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Police station creation details</param>
    /// <returns>Created police station information</returns>
    /// <response code="200">Police station created successfully</response>
    /// <response code="400">Validation failed or station already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Station Authority can create stations</response>
    [HttpPost("create")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(PolicestationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePolicestation([FromBody] CreatePolicestationDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Police station creation attempt by Station Authority {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _policestationService.CreatePolicestationAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Police station creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Police station created successfully: {StationName}", dto.StationName);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Get police station by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns detailed information about a specific police station including assigned officers.
    /// </remarks>
    /// <param name="id">Police station ID</param>
    /// <returns>Police station details</returns>
    /// <response code="200">Returns police station details</response>
    /// <response code="404">Police station not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(PolicestationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPolicestationById(int id)
    {
        var result = await _policestationService.GetPolicestationByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Police station retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all police stations.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns list of all police stations in the system.
    /// </remarks>
    /// <returns>List of police stations</returns>
    /// <response code="200">Returns list of police stations</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize]
    [ProducesResponseType(typeof(PolicestationListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllPolicestations()
    {
        var result = await _policestationService.GetAllPolicestationsAsync();

        return Ok(new
        {
            message = "Police stations retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get police stations by province.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Filter police stations by province (Punjab, Sindh, KPK, Balochistan).
    /// 
    /// Sample: GET /api/policestation/province/Punjab
    /// </remarks>
    /// <param name="province">Province name</param>
    /// <returns>Filtered list of police stations</returns>
    /// <response code="200">Returns filtered police stations</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("province/{province}")]
    [Authorize]
    [ProducesResponseType(typeof(PolicestationListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPolicestationsByProvince(string province)
    {
        var result = await _policestationService.GetPolicestationsByProvinceAsync(province);

        return Ok(new
        {
            message = $"Police stations in {province} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get police station by station code.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Find police station by unique station code.
    /// 
    /// Sample: GET /api/policestation/code/LHR-CANT-001
    /// </remarks>
    /// <param name="stationCode">Station code</param>
    /// <returns>Police station details</returns>
    /// <response code="200">Returns police station details</response>
    /// <response code="404">Police station not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("code/{stationCode}")]
    [Authorize]
    [ProducesResponseType(typeof(PolicestationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPolicestationByCode(string stationCode)
    {
        var result = await _policestationService.GetPolicestationByCodeAsync(stationCode);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Police station retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Update police station (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/policestation/update
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "stationId": 1,
    ///         "stationName": "Lahore Cantonment Police Station - Updated",
    ///         "stationCode": "LHR-CANT-001",
    ///         "location": "New Mall Road, Cantonment",
    ///         "district": "Lahore",
    ///         "province": "Punjab",
    ///         "contact": "+92-42-9876543"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Police station update details</param>
    /// <returns>Updated police station information</returns>
    /// <response code="200">Police station updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can update</response>
    /// <response code="404">Police station not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(PolicestationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePolicestation([FromBody] UpdatePolicestationDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Police station update attempt by Station Authority {UpdaterId} for Station {StationId}",
            updaterUserId, dto.StationId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _policestationService.UpdatePolicestationAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Police station update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Police station updated successfully: {StationId}", dto.StationId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Delete police station (Admin only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Admin role
    /// 
    /// Permanently deletes a police station. Station must have no assigned officers.
    /// 
    /// Sample: DELETE /api/policestation/delete/1
    /// </remarks>
    /// <param name="id">Police station ID to delete</param>
    /// <returns>Success message</returns>
    /// <response code="200">Police station deleted successfully</response>
    /// <response code="400">Station has assigned officers</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Admin can delete</response>
    /// <response code="404">Police station not found</response>
    [HttpDelete("delete/{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePolicestation(int id)
    {
        var deleterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Police station deletion attempt by Admin {DeleterId} for Station {StationId}",
            deleterUserId, id);

        var result = await _policestationService.DeletePolicestationAsync(id, deleterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Police station deletion failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("Police station deleted successfully: {StationId}", id);
        return Ok(new { message = result.Data });
    }
}