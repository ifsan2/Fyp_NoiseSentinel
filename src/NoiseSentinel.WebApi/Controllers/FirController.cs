using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Fir;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// FIR (First Information Report) Management Controller.
/// Handles FIR filing for cognizable traffic violations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FirController : ControllerBase
{
    private readonly IFirService _firService;
    private readonly ILogger<FirController> _logger;

    public FirController(
        IFirService firService,
        ILogger<FirController> logger)
    {
        _firService = firService;
        _logger = logger;
    }

    // ========================================================================
    // FIR CREATION & MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Create a new FIR (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// **Requirements:**
    /// - Challan must exist
    /// - Violation must be cognizable (IsCognizable = true)
    /// - Challan must not already have an FIR
    /// 
    /// **Auto-Generated:**
    /// - FIR Number: Format FIR-{StationCode}-{Year}-{SequenceNumber}
    ///   Example: FIR-LHRCANT001-2025-0001
    /// 
    /// Sample request:
    /// 
    ///     POST /api/fir/create
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "challanId": 1,
    ///         "firDescription": "Modified silencer detected on vehicle PK-ABC-123. Sound level exceeded 95 dBA (legal limit 85 dBA). IoT device readings confirmed. Vehicle owner identified as Muhammad Ali (CNIC: 35202-1234567-8). Case recommended for prosecution.",
    ///         "investigationReport": "Preliminary investigation shows vehicle silencer was deliberately modified to reduce noise suppression."
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">FIR creation details</param>
    /// <returns>Created FIR with evidence chain</returns>
    /// <response code="200">FIR filed successfully</response>
    /// <response code="400">Validation failed or violation not cognizable</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can file FIRs</response>
    [HttpPost("create")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(FirResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateFir([FromBody] CreateFirDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("FIR creation attempt by Station Authority {CreatorId} for Challan {ChallanId}",
            creatorUserId, dto.ChallanId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _firService.CreateFirAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("FIR creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("FIR filed successfully: {FirNo}", result.Data?.FirNo);

        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    // ========================================================================
    // FIR RETRIEVAL
    // ========================================================================

    /// <summary>
    /// Get FIR by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority, Court Authority, Judge
    /// 
    /// Returns complete FIR details with full evidence chain.
    /// </remarks>
    /// <param name="id">FIR ID</param>
    /// <returns>FIR details with evidence</returns>
    /// <response code="200">Returns FIR details</response>
    /// <response code="404">FIR not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")]
    [ProducesResponseType(typeof(FirResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirById(int id)
    {
        var result = await _firService.GetFirByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "FIR retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get FIR by FIR number.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority, Court Authority, Judge
    /// 
    /// Search for FIR by unique FIR number.
    /// 
    /// Sample: GET /api/fir/number/FIR-LHRCANT001-2025-0001
    /// </remarks>
    /// <param name="firNo">FIR number</param>
    /// <returns>FIR details</returns>
    /// <response code="200">Returns FIR details</response>
    /// <response code="404">FIR not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("number/{firNo}")]
    [Authorize(Policy = "AllRoles")]
    [ProducesResponseType(typeof(FirResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirByNumber(string firNo)
    {
        var result = await _firService.GetFirByFirNoAsync(firNo);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "FIR retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all FIRs.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority, Court Authority
    /// 
    /// Returns list of all FIRs in the system.
    /// </remarks>
    /// <returns>List of FIRs</returns>
    /// <response code="200">Returns all FIRs</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "StationAuthorityOrCourtAuthority")]
    [ProducesResponseType(typeof(FirListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllFirs()
    {
        var result = await _firService.GetAllFirsAsync();

        return Ok(new
        {
            message = "FIRs retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get FIRs by station.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns all FIRs filed by a specific police station.
    /// 
    /// Sample: GET /api/fir/station/1
    /// </remarks>
    /// <param name="stationId">Police station ID</param>
    /// <returns>List of FIRs from station</returns>
    /// <response code="200">Returns FIRs</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("station/{stationId}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(FirListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirsByStation(int stationId)
    {
        var result = await _firService.GetFirsByStationAsync(stationId);

        return Ok(new
        {
            message = $"FIRs from station {stationId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get FIRs by informant (police officer).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns FIRs where specific officer is listed as informant.
    /// 
    /// Sample: GET /api/fir/informant/1
    /// </remarks>
    /// <param name="informantId">Police officer ID</param>
    /// <returns>List of FIRs</returns>
    /// <response code="200">Returns FIRs</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("informant/{informantId}")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(FirListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirsByInformant(int informantId)
    {
        var result = await _firService.GetFirsByInformantAsync(informantId);

        return Ok(new
        {
            message = $"FIRs with informant {informantId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get FIRs by status.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority, Court Authority
    /// 
    /// Filter FIRs by investigation status.
    /// 
    /// **Status Options:**
    /// - Filed
    /// - Under Investigation
    /// - Closed
    /// 
    /// Sample: GET /api/fir/status/Filed
    /// </remarks>
    /// <param name="status">FIR status</param>
    /// <returns>List of FIRs with status</returns>
    /// <response code="200">Returns FIRs</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("status/{status}")]
    [Authorize(Policy = "StationAuthorityOrCourtAuthority")]
    [ProducesResponseType(typeof(FirListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirsByStatus(string status)
    {
        var result = await _firService.GetFirsByStatusAsync(status);

        return Ok(new
        {
            message = $"FIRs with status '{status}' retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get FIRs by date range.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority, Court Authority
    /// 
    /// Sample: GET /api/fir/daterange?startDate=2025-10-01&endDate=2025-10-07
    /// </remarks>
    /// <param name="startDate">Start date (UTC)</param>
    /// <param name="endDate">End date (UTC)</param>
    /// <returns>List of FIRs in date range</returns>
    /// <response code="200">Returns FIRs</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("daterange")]
    [Authorize(Policy = "StationAuthorityOrCourtAuthority")]
    [ProducesResponseType(typeof(FirListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await _firService.GetFirsByDateRangeAsync(startDate, endDate);

        return Ok(new
        {
            message = $"FIRs from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    // ========================================================================
    // COGNIZABLE CHALLANS (FOR FIR WORKFLOW)
    // ========================================================================

    /// <summary>
    /// Get cognizable challans eligible for FIR filing.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns challans with cognizable violations that don't have FIRs yet.
    /// Use this to see which challans are eligible for FIR filing.
    /// 
    /// **Criteria:**
    /// - Violation.IsCognizable = true
    /// - No FIR filed yet
    /// </remarks>
    /// <returns>List of cognizable challans without FIRs</returns>
    /// <response code="200">Returns cognizable challans</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("cognizable-challans")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(CognizableChallanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCognizableChallans()
    {
        var result = await _firService.GetCognizableChallansAsync();

        return Ok(new
        {
            message = "Cognizable challans eligible for FIR filing retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data,
            instruction = "These challans have cognizable violations and can have FIRs filed"
        });
    }

    /// <summary>
    /// Search FIRs with multiple criteria.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority, Court Authority, or Judge
    /// 
    /// Search FIRs by any combination of:
    /// - FIR number
    /// - Challan ID
    /// - Vehicle plate number
    /// - Accused CNIC
    /// - Accused name
    /// - FIR status
    /// - Station ID
    /// - Date filed range
    /// - Has/doesn't have case
    /// 
    /// Sample request:
    /// 
    ///     POST /api/fir/search
    ///     Authorization: Bearer {token}
    ///     {
    ///         "vehiclePlateNumber": "ABC-123",
    ///         "accusedCnic": "12345-1234567-1",
    ///         "hasCase": false
    ///     }
    /// 
    /// **Returns:** List of matching FIRs
    /// </remarks>
    /// <param name="searchDto">Search criteria</param>
    [HttpPost("search")]
    [Authorize]
    [ProducesResponseType(typeof(FirListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SearchFirs([FromBody] FirSearchDto searchDto)
    {
        _logger.LogInformation("FIR search requested");

        var result = await _firService.SearchFirsAsync(searchDto);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new
        {
            message = result.Message,
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    // ========================================================================
    // FIR UPDATE
    // ========================================================================

    /// <summary>
    /// Update FIR status and investigation report (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Update FIR investigation status and add investigation findings.
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/fir/update
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "firId": 1,
    ///         "firStatus": "Under Investigation",
    ///         "investigationReport": "Vehicle inspection conducted. Modified silencer confirmed. Owner admitted to modification for aesthetic purposes. Witness statements collected."
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">FIR update details</param>
    /// <returns>Updated FIR information</returns>
    /// <response code="200">FIR updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can update</response>
    /// <response code="404">FIR not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(FirResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFir([FromBody] UpdateFirDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("FIR update attempt by Station Authority {UpdaterId} for FIR {FirId}",
            updaterUserId, dto.FirId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _firService.UpdateFirAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("FIR update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("FIR updated successfully: {FirId}", dto.FirId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }
}