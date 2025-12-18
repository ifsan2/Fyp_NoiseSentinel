using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.DTOs.Case;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Case Management Controller.
/// Handles court case creation from FIRs and case proceedings.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CaseController : ControllerBase
{
    private readonly ICaseService _caseService;
    private readonly NoiseSentinelDbContext _context;
    private readonly ILogger<CaseController> _logger;

    public CaseController(
        ICaseService caseService,
        NoiseSentinelDbContext context,
        ILogger<CaseController> logger)
    {
        _caseService = caseService;
        _context = context;
        _logger = logger;
    }

    // ========================================================================
    // CASE CREATION & MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Create a new case from FIR (Court Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority
    /// 
    /// **Requirements:**
    /// - FIR must exist
    /// - FIR must not already have a case
    /// - Judge must exist and belong to a court
    /// 
    /// **Auto-Generated:**
    /// - Case Number: Format CASE-{CourtType}-{City}-{Year}-{SequenceNumber}
    ///   Example: CASE-HC-LHR-2025-0001
    /// - Default Hearing Date: 30 days from now if not specified
    /// 
    /// Sample request:
    /// 
    ///     POST /api/case/create
    ///     Authorization: Bearer {court-authority-token}
    ///     {
    ///         "firId": 1,
    ///         "judgeId": 2,
    ///         "caseType": "Traffic Violation - Noise Pollution",
    ///         "hearingDate": "2025-11-15T10:00:00Z"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Case creation details</param>
    /// <returns>Created case with evidence chain</returns>
    /// <response code="200">Case created successfully</response>
    /// <response code="400">Validation failed or FIR already has case</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Court Authority can create cases</response>
    [HttpPost("create")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateCase([FromBody] CreateCaseDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Case creation attempt by Court Authority {CreatorId} for FIR {FirId}",
            creatorUserId, dto.FirId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _caseService.CreateCaseAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Case creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Case created successfully: {CaseNo}", result.Data?.CaseNo);

        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    // ========================================================================
    // CASE RETRIEVAL
    // ========================================================================

    /// <summary>
    /// Get case by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority, Judge, Station Authority
    /// 
    /// Returns complete case details with full evidence chain.
    /// Station Authority can view cases related to their FIRs.
    /// </remarks>
    /// <param name="id">Case ID</param>
    /// <returns>Case details with evidence</returns>
    /// <response code="200">Returns case details</response>
    /// <response code="404">Case not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(CaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCaseById(int id)
    {
        var result = await _caseService.GetCaseByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Case retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get case by case number.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority, Judge
    /// 
    /// Search for case by unique case number.
    /// 
    /// Sample: GET /api/case/number/CASE-HC-LHR-2025-0001
    /// </remarks>
    /// <param name="caseNo">Case number</param>
    /// <returns>Case details</returns>
    /// <response code="200">Returns case details</response>
    /// <response code="404">Case not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("number/{caseNo}")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCaseByNumber(string caseNo)
    {
        var result = await _caseService.GetCaseByCaseNoAsync(caseNo);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Case retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all cases.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority
    /// 
    /// Returns list of all cases in the system.
    /// </remarks>
    /// <returns>List of cases</returns>
    /// <response code="200">Returns all cases</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CaseListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllCases()
    {
        var result = await _caseService.GetAllCasesAsync();

        return Ok(new
        {
            message = "Cases retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get my cases (Judge - assigned cases).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge
    /// 
    /// Returns cases assigned to the authenticated judge.
    /// </remarks>
    /// <returns>List of judge's cases</returns>
    /// <response code="200">Returns judge's cases</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("my-cases")]
    [Authorize(Policy = "JudgeOnly")]
    [ProducesResponseType(typeof(CaseListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyCases()
    {
        var judgeUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Get JudgeId from User
        var judge = await _context.Users
            .Include(u => u.Judges)
            .FirstOrDefaultAsync(u => u.Id == judgeUserId);

        if (judge?.Judges == null || !judge.Judges.Any())
        {
            return BadRequest(new { message = "Judge record not found." });
        }

        var judgeId = judge.Judges.First().JudgeId;

        var result = await _caseService.GetCasesByJudgeAsync(judgeId);

        return Ok(new
        {
            message = "Your assigned cases retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get cases by court.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority
    /// 
    /// Returns all cases for a specific court.
    /// 
    /// Sample: GET /api/case/court/1
    /// </remarks>
    /// <param name="courtId">Court ID</param>
    /// <returns>List of court's cases</returns>
    /// <response code="200">Returns cases</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("court/{courtId}")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CaseListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCasesByCourt(int courtId)
    {
        var result = await _caseService.GetCasesByCourtAsync(courtId);

        return Ok(new
        {
            message = $"Cases for court {courtId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get cases by status.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority, Judge
    /// 
    /// Filter cases by status.
    /// 
    /// **Status Options:**
    /// - Pending
    /// - Under Review
    /// - Verdict Given
    /// - Closed
    /// 
    /// Sample: GET /api/case/status/Pending
    /// </remarks>
    /// <param name="status">Case status</param>
    /// <returns>List of cases with status</returns>
    /// <response code="200">Returns cases</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("status/{status}")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCasesByStatus(string status)
    {
        var result = await _caseService.GetCasesByStatusAsync(status);

        return Ok(new
        {
            message = $"Cases with status '{status}' retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get cases by hearing date range.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority, Judge
    /// 
    /// Sample: GET /api/case/hearings?startDate=2025-10-01&endDate=2025-10-31
    /// </remarks>
    /// <param name="startDate">Start date (UTC)</param>
    /// <param name="endDate">End date (UTC)</param>
    /// <returns>List of cases with hearings in date range</returns>
    /// <response code="200">Returns cases</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("hearings")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCasesByHearingDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await _caseService.GetCasesByHearingDateRangeAsync(startDate, endDate);

        return Ok(new
        {
            message = $"Cases with hearings from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    // ========================================================================
    // FIRS WITHOUT CASES (FOR CASE CREATION WORKFLOW)
    // ========================================================================

    /// <summary>
    /// Get FIRs without cases (eligible for case creation).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority
    /// 
    /// Returns FIRs that don't have cases yet.
    /// Use this to see which FIRs are eligible for case creation.
    /// </remarks>
    /// <returns>List of FIRs without cases</returns>
    /// <response code="200">Returns FIRs without cases</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("firs-without-cases")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(FirWithoutCaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFirsWithoutCases()
    {
        var result = await _caseService.GetFirsWithoutCasesAsync();

        return Ok(new
        {
            message = "FIRs without cases retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data,
            instruction = "These FIRs are eligible for case creation"
        });
    }

    /// <summary>
    /// Search cases with multiple criteria.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority or Judge
    /// 
    /// Search cases by any combination of:
    /// - Case number
    /// - FIR number
    /// - Vehicle plate number
    /// - Accused CNIC
    /// - Accused name
    /// - Case status
    /// - Case type
    /// - Judge ID
    /// - Hearing date range
    /// 
    /// Sample request:
    /// 
    ///     POST /api/case/search
    ///     Authorization: Bearer {token}
    ///     {
    ///         "vehiclePlateNumber": "ABC-123",
    ///         "accusedCnic": "12345-1234567-1",
    ///         "caseStatus": "Pending"
    ///     }
    /// 
    /// **Returns:** List of matching cases
    /// </remarks>
    /// <param name="searchDto">Search criteria</param>
    [HttpPost("search")]
    [Authorize(Policy = "CourtOrJudgeOnly")]
    [ProducesResponseType(typeof(CaseListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SearchCases([FromBody] CaseSearchDto searchDto)
    {
        _logger.LogInformation("Case search requested");

        var result = await _caseService.SearchCasesAsync(searchDto);

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
    // CASE UPDATE
    // ========================================================================

    /// <summary>
    /// Update case details (Court Authority or Judge).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority or Judge
    /// 
    /// Update case status, hearing date, and verdict.
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/case/update
    ///     Authorization: Bearer {court-authority-or-judge-token}
    ///     {
    ///         "caseId": 1,
    ///         "caseStatus": "Under Review",
    ///         "hearingDate": "2025-11-20T10:00:00Z",
    ///         "verdict": null
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Case update details</param>
    /// <returns>Updated case information</returns>
    /// <response code="200">Case updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden</response>
    /// <response code="404">Case not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCase([FromBody] UpdateCaseDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Case update attempt by User {UpdaterId} for Case {CaseId}",
            updaterUserId, dto.CaseId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _caseService.UpdateCaseAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Case update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Case updated successfully: {CaseId}", dto.CaseId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Assign/Reassign judge to case (Court Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority
    /// 
    /// Assign or change the judge for a case.
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/case/assign-judge
    ///     Authorization: Bearer {court-authority-token}
    ///     {
    ///         "caseId": 1,
    ///         "judgeId": 3
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Judge assignment details</param>
    /// <returns>Updated case with new judge</returns>
    /// <response code="200">Judge assigned successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Court Authority can assign judges</response>
    /// <response code="404">Case or Judge not found</response>
    [HttpPut("assign-judge")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignJudge([FromBody] AssignJudgeDto dto)
    {
        var assignerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Judge assignment attempt by Court Authority {AssignerId} for Case {CaseId}",
            assignerUserId, dto.CaseId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _caseService.AssignJudgeAsync(dto, assignerUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Judge assignment failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Judge assigned successfully to Case {CaseId}", dto.CaseId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }
}