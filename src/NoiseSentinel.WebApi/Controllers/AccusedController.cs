using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Accused;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Accused Management Controller.
/// Handles person registration, search, and violation history.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AccusedController : ControllerBase
{
    private readonly IAccusedService _accusedService;
    private readonly ILogger<AccusedController> _logger;

    public AccusedController(
        IAccusedService accusedService,
        ILogger<AccusedController> logger)
    {
        _accusedService = accusedService;
        _logger = logger;
    }

    // ========================================================================
    // ACCUSED REGISTRATION & MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Create a new accused person (Police Officer, Station Authority).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer or Station Authority
    /// 
    /// Sample request:
    /// 
    ///     POST /api/accused/create
    ///     Authorization: Bearer {officer-or-station-token}
    ///     {
    ///         "fullName": "Muhammad Ali",
    ///         "cnic": "35202-1234567-8",
    ///         "city": "Lahore",
    ///         "province": "Punjab",
    ///         "address": "123 Main St, Model Town, Lahore",
    ///         "contact": "+92-300-1234567"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Accused creation details</param>
    /// <returns>Created accused information</returns>
    /// <response code="200">Person registered successfully</response>
    /// <response code="400">Validation failed or CNIC already exists</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden</response>
    [HttpPost("create")]
    [Authorize(Policy = "StationRoles")]
    [ProducesResponseType(typeof(AccusedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAccused([FromBody] CreateAccusedDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Accused creation attempt by User {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _accusedService.CreateAccusedAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Accused creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Accused registered successfully: {FullName}, CNIC: {Cnic}",
            dto.FullName, dto.Cnic);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Get accused by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns detailed person information including vehicles and violation history.
    /// </remarks>
    /// <param name="id">Accused ID</param>
    /// <returns>Accused details</returns>
    /// <response code="200">Returns accused details</response>
    /// <response code="404">Person not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(AccusedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAccusedById(int id)
    {
        var result = await _accusedService.GetAccusedByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Person retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get accused by CNIC.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Search for person by CNIC number.
    /// 
    /// Sample: GET /api/accused/cnic/35202-1234567-8
    /// </remarks>
    /// <param name="cnic">CNIC number (format: 12345-1234567-1)</param>
    /// <returns>Accused details</returns>
    /// <response code="200">Returns accused details</response>
    /// <response code="404">Person not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("cnic/{cnic}")]
    [Authorize]
    [ProducesResponseType(typeof(AccusedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAccusedByCnic(string cnic)
    {
        var result = await _accusedService.GetAccusedByCnicAsync(cnic);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Person retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all accused persons.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns list of all registered persons.
    /// </remarks>
    /// <returns>List of accused persons</returns>
    /// <response code="200">Returns list of accused</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(AccusedListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllAccused()
    {
        var result = await _accusedService.GetAllAccusedAsync();

        return Ok(new
        {
            message = "Accused persons retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Search accused by name.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Search persons by name (partial match, case-insensitive).
    /// 
    /// Sample: GET /api/accused/search/muhammad
    /// </remarks>
    /// <param name="name">Name search term</param>
    /// <returns>List of matching persons</returns>
    /// <response code="200">Returns matching persons</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("search/{name}")]
    [Authorize]
    [ProducesResponseType(typeof(AccusedListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SearchAccusedByName(string name)
    {
        var result = await _accusedService.SearchAccusedByNameAsync(name);

        return Ok(new
        {
            message = $"Persons matching '{name}' retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get accused by province.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Sample: GET /api/accused/province/Punjab
    /// </remarks>
    /// <param name="province">Province name</param>
    /// <returns>List of persons in province</returns>
    /// <response code="200">Returns persons</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("province/{province}")]
    [Authorize]
    [ProducesResponseType(typeof(AccusedListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAccusedByProvince(string province)
    {
        var result = await _accusedService.GetAccusedByProvinceAsync(province);

        return Ok(new
        {
            message = $"Persons in {province} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get accused by city.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Sample: GET /api/accused/city/Lahore
    /// </remarks>
    /// <param name="city">City name</param>
    /// <returns>List of persons in city</returns>
    /// <response code="200">Returns persons</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("city/{city}")]
    [Authorize]
    [ProducesResponseType(typeof(AccusedListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAccusedByCity(string city)
    {
        var result = await _accusedService.GetAccusedByCityAsync(city);

        return Ok(new
        {
            message = $"Persons in {city} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Update accused (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/accused/update
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "accusedId": 1,
    ///         "fullName": "Muhammad Ali - Updated",
    ///         "cnic": "35202-1234567-8",
    ///         "city": "Lahore",
    ///         "province": "Punjab",
    ///         "address": "456 New Address, Lahore",
    ///         "contact": "+92-301-7654321"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Accused update details</param>
    /// <returns>Updated accused information</returns>
    /// <response code="200">Person updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can update</response>
    /// <response code="404">Person not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(AccusedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAccused([FromBody] UpdateAccusedDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Accused update attempt by Station Authority {UpdaterId} for Accused {AccusedId}",
            updaterUserId, dto.AccusedId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _accusedService.UpdateAccusedAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Accused update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Accused updated successfully: {AccusedId}", dto.AccusedId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Delete accused (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Permanently deletes a person. Person must have no linked challans or vehicles.
    /// 
    /// Sample: DELETE /api/accused/delete/1
    /// </remarks>
    /// <param name="id">Accused ID to delete</param>
    /// <returns>Success message</returns>
    /// <response code="200">Person deleted successfully</response>
    /// <response code="400">Person has linked challans or vehicles</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can delete</response>
    /// <response code="404">Person not found</response>
    [HttpDelete("delete/{id}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAccused(int id)
    {
        var deleterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Accused deletion attempt by Station Authority {DeleterId} for Accused {AccusedId}",
            deleterUserId, id);

        var result = await _accusedService.DeleteAccusedAsync(id, deleterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Accused deletion failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("Accused deleted successfully: {AccusedId}", id);
        return Ok(new { message = result.Data });
    }
}