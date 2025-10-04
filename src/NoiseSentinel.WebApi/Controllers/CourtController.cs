using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Court;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Court Management Controller.
/// Handles CRUD operations for courts and court types.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CourtController : ControllerBase
{
    private readonly ICourtService _courtService;
    private readonly ILogger<CourtController> _logger;

    public CourtController(ICourtService courtService, ILogger<CourtController> logger)
    {
        _courtService = courtService;
        _logger = logger;
    }

    // ========================================================================
    // COURT TYPE ENDPOINTS
    // ========================================================================

    /// <summary>
    /// Get all court types (Supreme Court, High Court, Civil Court).
    /// </summary>
    /// <remarks>
    /// **Public Endpoint** - No authentication required.
    /// 
    /// Returns the list of available court types.
    /// </remarks>
    /// <returns>List of court types</returns>
    /// <response code="200">Returns list of court types</response>
    [HttpGet("types")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CourttypeResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourtTypes()
    {
        var result = await _courtService.GetCourtTypesAsync();

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Court types retrieved successfully",
            data = result.Data
        });
    }

    // ========================================================================
    // COURT CRUD ENDPOINTS
    // ========================================================================

    /// <summary>
    /// Create a new court (Court Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority role
    /// 
    /// Sample request:
    /// 
    ///     POST /api/court/create
    ///     Authorization: Bearer {court-authority-token}
    ///     {
    ///         "courtName": "Lahore High Court",
    ///         "courtTypeId": 2,
    ///         "location": "Mall Road, Lahore",
    ///         "district": "Lahore",
    ///         "province": "Punjab"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Court creation details</param>
    /// <returns>Created court information</returns>
    /// <response code="200">Court created successfully</response>
    /// <response code="400">Validation failed or court already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Court Authority can create courts</response>
    [HttpPost("create")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CourtResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateCourt([FromBody] CreateCourtDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Court creation attempt by Court Authority {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _courtService.CreateCourtAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Court creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Court created successfully: {CourtName}", dto.CourtName);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Get court by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns detailed information about a specific court including assigned judges.
    /// </remarks>
    /// <param name="id">Court ID</param>
    /// <returns>Court details</returns>
    /// <response code="200">Returns court details</response>
    /// <response code="404">Court not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(CourtResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCourtById(int id)
    {
        var result = await _courtService.GetCourtByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Court retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all courts.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns list of all courts in the system.
    /// </remarks>
    /// <returns>List of courts</returns>
    /// <response code="200">Returns list of courts</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize]
    [ProducesResponseType(typeof(CourtListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllCourts()
    {
        var result = await _courtService.GetAllCourtsAsync();

        return Ok(new
        {
            message = "Courts retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get courts by type.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Filter courts by court type (Supreme, High, Civil).
    /// 
    /// Sample: GET /api/court/type/2 (High Courts)
    /// </remarks>
    /// <param name="courtTypeId">Court type ID</param>
    /// <returns>Filtered list of courts</returns>
    /// <response code="200">Returns filtered courts</response>
    /// <response code="400">Invalid court type</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("type/{courtTypeId}")]
    [Authorize]
    [ProducesResponseType(typeof(CourtListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCourtsByType(int courtTypeId)
    {
        var result = await _courtService.GetCourtsByTypeAsync(courtTypeId);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Courts retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get courts by province.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Filter courts by province (Punjab, Sindh, KPK, Balochistan).
    /// 
    /// Sample: GET /api/court/province/Punjab
    /// </remarks>
    /// <param name="province">Province name</param>
    /// <returns>Filtered list of courts</returns>
    /// <response code="200">Returns filtered courts</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("province/{province}")]
    [Authorize]
    [ProducesResponseType(typeof(CourtListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCourtsByProvince(string province)
    {
        var result = await _courtService.GetCourtsByProvinceAsync(province);

        return Ok(new
        {
            message = $"Courts in {province} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Update court (Court Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority role
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/court/update
    ///     Authorization: Bearer {court-authority-token}
    ///     {
    ///         "courtId": 1,
    ///         "courtName": "Lahore High Court - Updated",
    ///         "courtTypeId": 2,
    ///         "location": "New Mall Road, Lahore",
    ///         "district": "Lahore",
    ///         "province": "Punjab"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Court update details</param>
    /// <returns>Updated court information</returns>
    /// <response code="200">Court updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Court Authority can update</response>
    /// <response code="404">Court not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CourtResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCourt([FromBody] UpdateCourtDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Court update attempt by Court Authority {UpdaterId} for Court {CourtId}",
            updaterUserId, dto.CourtId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _courtService.UpdateCourtAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Court update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Court updated successfully: {CourtId}", dto.CourtId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Delete court (Admin only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Admin role
    /// 
    /// Permanently deletes a court. Court must have no assigned judges.
    /// 
    /// Sample: DELETE /api/court/delete/1
    /// </remarks>
    /// <param name="id">Court ID to delete</param>
    /// <returns>Success message</returns>
    /// <response code="200">Court deleted successfully</response>
    /// <response code="400">Court has assigned judges</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Admin can delete</response>
    /// <response code="404">Court not found</response>
    [HttpDelete("delete/{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCourt(int id)
    {
        var deleterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Court deletion attempt by Admin {DeleterId} for Court {CourtId}",
            deleterUserId, id);

        var result = await _courtService.DeleteCourtAsync(id, deleterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Court deletion failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("Court deleted successfully: {CourtId}", id);
        return Ok(new { message = result.Data });
    }
}