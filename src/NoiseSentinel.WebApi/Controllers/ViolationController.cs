using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Violation;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Violation Management Controller.
/// Handles CRUD operations for violation types.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ViolationController : ControllerBase
{
    private readonly IViolationService _violationService;
    private readonly ILogger<ViolationController> _logger;

    public ViolationController(
        IViolationService violationService,
        ILogger<ViolationController> logger)
    {
        _violationService = violationService;
        _logger = logger;
    }

    // ========================================================================
    // VIOLATION CRUD ENDPOINTS
    // ========================================================================

    /// <summary>
    /// Create a new violation type (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     POST /api/violation/create
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "violationType": "Modified Silencer",
    ///         "description": "Vehicle silencer has been tampered or modified",
    ///         "penaltyAmount": 5000,
    ///         "sectionOfLaw": "Section 123 Motor Vehicle Ordinance",
    ///         "isCognizable": true
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Violation creation details</param>
    /// <returns>Created violation information</returns>
    /// <response code="200">Violation created successfully</response>
    /// <response code="400">Validation failed or violation type already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Station Authority can create violations</response>
    [HttpPost("create")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ViolationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateViolation([FromBody] CreateViolationDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Violation creation attempt by Station Authority {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _violationService.CreateViolationAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Violation creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Violation created successfully: {ViolationType}", dto.ViolationType);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Get violation by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns detailed information about a specific violation type.
    /// </remarks>
    /// <param name="id">Violation ID</param>
    /// <returns>Violation details</returns>
    /// <response code="200">Returns violation details</response>
    /// <response code="404">Violation not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ViolationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetViolationById(int id)
    {
        var result = await _violationService.GetViolationByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Violation retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all violations.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns list of all violation types in the system.
    /// </remarks>
    /// <returns>List of violations</returns>
    /// <response code="200">Returns list of violations</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize]
    [ProducesResponseType(typeof(ViolationListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllViolations()
    {
        var result = await _violationService.GetAllViolationsAsync();

        return Ok(new
        {
            message = "Violations retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get cognizable violations (for FIR workflow).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns violations where IsCognizable = true.
    /// Used for FIR creation workflow.
    /// </remarks>
    /// <returns>List of cognizable violations</returns>
    /// <response code="200">Returns cognizable violations</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("cognizable")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ViolationListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCognizableViolations()
    {
        var result = await _violationService.GetCognizableViolationsAsync();

        return Ok(new
        {
            message = "Cognizable violations retrieved successfully (can file FIR)",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Search violations by type.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Search violations by type name (partial match, case-insensitive).
    /// 
    /// Sample: GET /api/violation/search/silencer
    /// </remarks>
    /// <param name="type">Search term (partial violation type name)</param>
    /// <returns>Filtered list of violations</returns>
    /// <response code="200">Returns filtered violations</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("search/{type}")]
    [Authorize]
    [ProducesResponseType(typeof(ViolationListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SearchViolationsByType(string type)
    {
        var result = await _violationService.SearchViolationsByTypeAsync(type);

        return Ok(new
        {
            message = $"Violations matching '{type}' retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Update violation (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/violation/update
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "violationId": 1,
    ///         "violationType": "Modified Silencer - Updated",
    ///         "description": "Updated description",
    ///         "penaltyAmount": 7500,
    ///         "sectionOfLaw": "Section 123A",
    ///         "isCognizable": true
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Violation update details</param>
    /// <returns>Updated violation information</returns>
    /// <response code="200">Violation updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can update</response>
    /// <response code="404">Violation not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ViolationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateViolation([FromBody] UpdateViolationDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Violation update attempt by Station Authority {UpdaterId} for Violation {ViolationId}",
            updaterUserId, dto.ViolationId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _violationService.UpdateViolationAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Violation update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Violation updated successfully: {ViolationId}", dto.ViolationId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Delete violation (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Permanently deletes a violation. Violation must have no linked challans.
    /// 
    /// Sample: DELETE /api/violation/delete/1
    /// </remarks>
    /// <param name="id">Violation ID to delete</param>
    /// <returns>Success message</returns>
    /// <response code="200">Violation deleted successfully</response>
    /// <response code="400">Violation has linked challans</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can delete</response>
    /// <response code="404">Violation not found</response>
    [HttpDelete("delete/{id}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteViolation(int id)
    {
        var deleterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Violation deletion attempt by Station Authority {DeleterId} for Violation {ViolationId}",
            deleterUserId, id);

        var result = await _violationService.DeleteViolationAsync(id, deleterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Violation deletion failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("Violation deleted successfully: {ViolationId}", id);
        return Ok(new { message = result.Data });
    }
}