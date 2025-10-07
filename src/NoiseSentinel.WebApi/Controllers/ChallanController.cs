using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.DTOs.Challan;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Challan Management Controller.
/// Handles traffic violation tickets with auto-creation of Vehicle and Accused.
/// IMMUTABLE: Challans cannot be modified after creation (evidence integrity).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ChallanController : ControllerBase
{
    private readonly IChallanService _challanService;
    private readonly NoiseSentinelDbContext _context;
    private readonly ILogger<ChallanController> _logger;

    public ChallanController(
        IChallanService challanService,
        NoiseSentinelDbContext context,
        ILogger<ChallanController> logger)
    {
        _challanService = challanService;
        _context = context;
        _logger = logger;
    }

    // ========================================================================
    // CHALLAN CREATION (IMMUTABLE - NO UPDATE/DELETE)
    // ========================================================================

    /// <summary>
    /// Create a new challan (Police Officer only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer
    /// 
    /// **IMPORTANT:** Challans are IMMUTABLE once created (cannot be modified/deleted).
    /// 
    /// **Auto-Creation Logic:**
    /// - If VehicleId is null, provide VehicleInput → System creates vehicle
    /// - If AccusedId is null, provide AccusedInput → System creates accused
    /// - Vehicle automatically linked to Accused as owner
    /// 
    /// **Sample Request (New Vehicle + New Accused):**
    /// 
    ///     POST /api/challan/create
    ///     Authorization: Bearer {police-officer-token}
    ///     {
    ///         "violationId": 1,
    ///         "emissionReportId": 1,
    ///         "vehicleId": null,
    ///         "vehicleInput": {
    ///             "plateNumber": "PK-ABC-123",
    ///             "make": "Honda City 2020",
    ///             "color": "White",
    ///             "chasisNo": "CH123456789",
    ///             "engineNo": "EN987654321",
    ///             "vehRegYear": "2020-01-15T00:00:00Z"
    ///         },
    ///         "accusedId": null,
    ///         "accusedInput": {
    ///             "fullName": "Muhammad Ali",
    ///             "cnic": "35202-1234567-8",
    ///             "city": "Lahore",
    ///             "province": "Punjab",
    ///             "address": "123 Main St, Model Town",
    ///             "contact": "+92-300-1234567"
    ///         },
    ///         "evidencePath": "/uploads/evidence/IMG001.jpg,IMG002.jpg",
    ///         "bankDetails": "Account: 1234567890, Bank: HBL"
    ///     }
    /// 
    /// **Sample Request (Existing Vehicle + Existing Accused):**
    /// 
    ///     POST /api/challan/create
    ///     {
    ///         "violationId": 1,
    ///         "emissionReportId": 2,
    ///         "vehicleId": 5,
    ///         "accusedId": 3,
    ///         "evidencePath": "/uploads/evidence/IMG003.jpg",
    ///         "bankDetails": "Account: 9876543210, Bank: UBL"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Challan creation details</param>
    /// <returns>Created challan with full evidence chain</returns>
    /// <response code="200">Challan created successfully</response>
    /// <response code="400">Validation failed or emission report already has challan</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Police Officers can create challans</response>
    [HttpPost("create")]
    [Authorize(Policy = "PoliceOfficerOnly")]
    [ProducesResponseType(typeof(ChallanResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateChallan([FromBody] CreateChallanDto dto)
    {
        var officerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Challan creation attempt by Police Officer {OfficerId} for EmissionReport {EmissionReportId}",
            officerUserId, dto.EmissionReportId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _challanService.CreateChallanAsync(dto, officerUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Challan creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Challan created successfully: {ChallanId}, IsCognizable: {IsCognizable}",
            result.Data?.ChallanId, result.Data?.IsCognizable);

        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    // ========================================================================
    // CHALLAN RETRIEVAL
    // ========================================================================

    /// <summary>
    /// Get challan by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer (own), Station Authority (all), Court/Judge (evidence)
    /// 
    /// Returns complete challan details with full evidence chain.
    /// </remarks>
    /// <param name="id">Challan ID</param>
    /// <returns>Challan details with evidence</returns>
    /// <response code="200">Returns challan details</response>
    /// <response code="404">Challan not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ChallanResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetChallanById(int id)
    {
        var result = await _challanService.GetChallanByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Challan retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get my challans (Police Officer - own challans).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer
    /// 
    /// Returns all challans issued by the authenticated officer.
    /// </remarks>
    /// <returns>List of officer's challans</returns>
    /// <response code="200">Returns officer's challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("my-challans")]
    [Authorize(Policy = "PoliceOfficerOnly")]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyChallans()
    {
        var officerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Get Policeofficer by UserId (query Policeofficers table directly)
        var policeofficer = await _context.Policeofficers
            .FirstOrDefaultAsync(p => p.UserId == officerUserId);

        if (policeofficer == null)
        {
            return BadRequest(new { message = "Police Officer record not found." });
        }

        var result = await _challanService.GetChallansByOfficerAsync(policeofficer.OfficerId);

        return Ok(new
        {
            message = "Your challans retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get all challans (Station Authority).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns all challans in the system.
    /// </remarks>
    /// <returns>List of all challans</returns>
    /// <response code="200">Returns all challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllChallans()
    {
        var result = await _challanService.GetAllChallansAsync();

        return Ok(new
        {
            message = "All challans retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get challans by station.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns all challans issued by officers from a specific police station.
    /// 
    /// Sample: GET /api/challan/station/1
    /// </remarks>
    /// <param name="stationId">Police station ID</param>
    /// <returns>List of challans from station</returns>
    /// <response code="200">Returns challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("station/{stationId}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetChallansByStation(int stationId)
    {
        var result = await _challanService.GetChallansByStationAsync(stationId);

        return Ok(new
        {
            message = $"Challans from station {stationId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get challans by vehicle.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns violation history for a specific vehicle.
    /// 
    /// Sample: GET /api/challan/vehicle/1
    /// </remarks>
    /// <param name="vehicleId">Vehicle ID</param>
    /// <returns>List of vehicle's challans</returns>
    /// <response code="200">Returns challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("vehicle/{vehicleId}")]
    [Authorize]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetChallansByVehicle(int vehicleId)
    {
        var result = await _challanService.GetChallansByVehicleAsync(vehicleId);

        return Ok(new
        {
            message = $"Challans for vehicle {vehicleId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get challans by accused.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns violation history for a specific person.
    /// 
    /// Sample: GET /api/challan/accused/1
    /// </remarks>
    /// <param name="accusedId">Accused person ID</param>
    /// <returns>List of person's challans</returns>
    /// <response code="200">Returns challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("accused/{accusedId}")]
    [Authorize]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetChallansByAccused(int accusedId)
    {
        var result = await _challanService.GetChallansByAccusedAsync(accusedId);

        return Ok(new
        {
            message = $"Challans for accused {accusedId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get challans by status.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Filter challans by payment status.
    /// 
    /// **Status Options:**
    /// - Unpaid
    /// - Paid
    /// - Disputed
    /// 
    /// Sample: GET /api/challan/status/Unpaid
    /// </remarks>
    /// <param name="status">Payment status</param>
    /// <returns>List of challans with status</returns>
    /// <response code="200">Returns challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("status/{status}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetChallansByStatus(string status)
    {
        var result = await _challanService.GetChallansByStatusAsync(status);

        return Ok(new
        {
            message = $"Challans with status '{status}' retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get challans by date range.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Sample: GET /api/challan/daterange?startDate=2025-10-01&endDate=2025-10-07
    /// </remarks>
    /// <param name="startDate">Start date (UTC)</param>
    /// <param name="endDate">End date (UTC)</param>
    /// <returns>List of challans in date range</returns>
    /// <response code="200">Returns challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("daterange")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetChallansByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await _challanService.GetChallansByDateRangeAsync(startDate, endDate);

        return Ok(new
        {
            message = $"Challans from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get overdue challans.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns challans that are past due date and still unpaid.
    /// </remarks>
    /// <returns>List of overdue challans</returns>
    /// <response code="200">Returns overdue challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("overdue")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(ChallanListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetOverdueChallans()
    {
        var result = await _challanService.GetOverdueChallansAsync();

        return Ok(new
        {
            message = "Overdue challans retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data,
            warning = "These challans are past due date and unpaid"
        });
    }
}