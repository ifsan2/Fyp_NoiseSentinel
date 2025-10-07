using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Vehicle;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Vehicle Management Controller.
/// Handles vehicle registration, search, and violation history.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class VehicleController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly ILogger<VehicleController> _logger;

    public VehicleController(
        IVehicleService vehicleService,
        ILogger<VehicleController> logger)
    {
        _vehicleService = vehicleService;
        _logger = logger;
    }

    // ========================================================================
    // VEHICLE REGISTRATION & MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Create a new vehicle (Police Officer, Station Authority).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer or Station Authority
    /// 
    /// Sample request:
    /// 
    ///     POST /api/vehicle/create
    ///     Authorization: Bearer {officer-or-station-token}
    ///     {
    ///         "plateNumber": "PK-ABC-123",
    ///         "make": "Honda City 2020",
    ///         "color": "White",
    ///         "chasisNo": "CH123456789",
    ///         "engineNo": "EN987654321",
    ///         "vehRegYear": "2020-01-15T00:00:00Z",
    ///         "ownerId": 1
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Vehicle creation details</param>
    /// <returns>Created vehicle information</returns>
    /// <response code="200">Vehicle registered successfully</response>
    /// <response code="400">Validation failed or plate number already exists</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden</response>
    [HttpPost("create")]
    [Authorize(Policy = "StationRoles")]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Vehicle creation attempt by User {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _vehicleService.CreateVehicleAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Vehicle creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Vehicle registered successfully: {PlateNumber}", dto.PlateNumber);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Get vehicle by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns detailed vehicle information including owner and violation history.
    /// </remarks>
    /// <param name="id">Vehicle ID</param>
    /// <returns>Vehicle details</returns>
    /// <response code="200">Returns vehicle details</response>
    /// <response code="404">Vehicle not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetVehicleById(int id)
    {
        var result = await _vehicleService.GetVehicleByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Vehicle retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get vehicle by plate number.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Search for vehicle by registration plate number.
    /// 
    /// Sample: GET /api/vehicle/plate/PK-ABC-123
    /// </remarks>
    /// <param name="plateNumber">Vehicle plate number</param>
    /// <returns>Vehicle details</returns>
    /// <response code="200">Returns vehicle details</response>
    /// <response code="404">Vehicle not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("plate/{plateNumber}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetVehicleByPlateNumber(string plateNumber)
    {
        var result = await _vehicleService.GetVehicleByPlateNumberAsync(plateNumber);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Vehicle retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all vehicles.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns list of all registered vehicles.
    /// </remarks>
    /// <returns>List of vehicles</returns>
    /// <response code="200">Returns list of vehicles</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(VehicleListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllVehicles()
    {
        var result = await _vehicleService.GetAllVehiclesAsync();

        return Ok(new
        {
            message = "Vehicles retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get vehicles by owner.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns all vehicles owned by a specific person.
    /// 
    /// Sample: GET /api/vehicle/owner/1
    /// </remarks>
    /// <param name="ownerId">Owner (Accused) ID</param>
    /// <returns>List of owner's vehicles</returns>
    /// <response code="200">Returns vehicles</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("owner/{ownerId}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetVehiclesByOwner(int ownerId)
    {
        var result = await _vehicleService.GetVehiclesByOwnerAsync(ownerId);

        return Ok(new
        {
            message = $"Vehicles for owner {ownerId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Search vehicles by make/model.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Search vehicles by make or model (partial match, case-insensitive).
    /// 
    /// Sample: GET /api/vehicle/search/honda
    /// </remarks>
    /// <param name="make">Make/Model search term</param>
    /// <returns>List of matching vehicles</returns>
    /// <response code="200">Returns matching vehicles</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("search/{make}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SearchVehiclesByMake(string make)
    {
        var result = await _vehicleService.SearchVehiclesByMakeAsync(make);

        return Ok(new
        {
            message = $"Vehicles matching '{make}' retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Update vehicle (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/vehicle/update
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "vehicleId": 1,
    ///         "plateNumber": "PK-ABC-123",
    ///         "make": "Honda City 2021 - Updated",
    ///         "color": "Silver",
    ///         "chasisNo": "CH123456789",
    ///         "engineNo": "EN987654321",
    ///         "vehRegYear": "2020-01-15T00:00:00Z",
    ///         "ownerId": 1
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Vehicle update details</param>
    /// <returns>Updated vehicle information</returns>
    /// <response code="200">Vehicle updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can update</response>
    /// <response code="404">Vehicle not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(VehicleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVehicle([FromBody] UpdateVehicleDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Vehicle update attempt by Station Authority {UpdaterId} for Vehicle {VehicleId}",
            updaterUserId, dto.VehicleId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _vehicleService.UpdateVehicleAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Vehicle update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Vehicle updated successfully: {VehicleId}", dto.VehicleId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Delete vehicle (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Permanently deletes a vehicle. Vehicle must have no linked challans.
    /// 
    /// Sample: DELETE /api/vehicle/delete/1
    /// </remarks>
    /// <param name="id">Vehicle ID to delete</param>
    /// <returns>Success message</returns>
    /// <response code="200">Vehicle deleted successfully</response>
    /// <response code="400">Vehicle has linked challans</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can delete</response>
    /// <response code="404">Vehicle not found</response>
    [HttpDelete("delete/{id}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var deleterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Vehicle deletion attempt by Station Authority {DeleterId} for Vehicle {VehicleId}",
            deleterUserId, id);

        var result = await _vehicleService.DeleteVehicleAsync(id, deleterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Vehicle deletion failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("Vehicle deleted successfully: {VehicleId}", id);
        return Ok(new { message = result.Data });
    }
}