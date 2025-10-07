using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.CaseStatement;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Case Statement Management Controller.
/// Handles judge's case proceedings, observations, and verdicts.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CaseStatementController : ControllerBase
{
    private readonly ICasestatementService _casestatementService;
    private readonly ILogger<CaseStatementController> _logger;

    public CaseStatementController(
        ICasestatementService casestatementService,
        ILogger<CaseStatementController> logger)
    {
        _casestatementService = casestatementService;
        _logger = logger;
    }

    // ========================================================================
    // CASE STATEMENT CREATION & MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Create a new case statement (Judge only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge
    /// 
    /// **Use Cases:**
    /// - Record hearing proceedings
    /// - Document case observations
    /// - Issue interim orders
    /// - Provide final verdict
    /// 
    /// **Requirements:**
    /// - Case must exist
    /// - Judge must be assigned to the case
    /// 
    /// Sample request (Hearing Proceeding):
    /// 
    ///     POST /api/casestatement/create
    ///     Authorization: Bearer {judge-token}
    ///     {
    ///         "caseId": 1,
    ///         "statementText": "Hearing conducted on 2025-10-07. Accused Muhammad Ali present with counsel. Evidence presented: IoT device emission report showing sound level of 95.5 dBA, exceeding legal limit of 85 dBA. Digital signature verified. Modified silencer confirmed through visual inspection. Defense argued economic hardship. Prosecution emphasized public health and noise pollution laws. Case adjourned for final arguments.",
    ///         "statementBy": "Justice Ali Hassan"
    ///     }
    /// 
    /// Sample request (Final Verdict):
    /// 
    ///     POST /api/casestatement/create
    ///     {
    ///         "caseId": 1,
    ///         "statementText": "FINAL VERDICT: After reviewing all evidence and arguments, this court finds the accused GUILTY of violating Section 123 Motor Vehicle Ordinance 2002. Evidence from calibrated IoT device (digitally signed) is credible and admissible. Accused is hereby sentenced to pay a fine of PKR 5,000 and required to restore vehicle to original condition within 30 days. Vehicle silencer modification is a cognizable offense affecting public health. Verdict is final.",
    ///         "statementBy": "Justice Ali Hassan"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Case statement details</param>
    /// <returns>Created case statement</returns>
    /// <response code="200">Case statement recorded successfully</response>
    /// <response code="400">Validation failed or judge not assigned to case</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Judges can create statements</response>
    [HttpPost("create")]
    [Authorize(Policy = "JudgeOnly")]
    [ProducesResponseType(typeof(CaseStatementResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateCaseStatement([FromBody] CreateCaseStatementDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Case statement creation attempt by Judge {CreatorId} for Case {CaseId}",
            creatorUserId, dto.CaseId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _casestatementService.CreateCaseStatementAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Case statement creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Case statement created successfully: {StatementId}", result.Data?.StatementId);

        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    // ========================================================================
    // CASE STATEMENT RETRIEVAL
    // ========================================================================

    /// <summary>
    /// Get case statement by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge, Court Authority
    /// 
    /// Returns detailed case statement with case context.
    /// </remarks>
    /// <param name="id">Statement ID</param>
    /// <returns>Case statement details</returns>
    /// <response code="200">Returns case statement details</response>
    /// <response code="404">Statement not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseStatementResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCaseStatementById(int id)
    {
        var result = await _casestatementService.GetCaseStatementByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Case statement retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all case statements for a specific case.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge, Court Authority
    /// 
    /// Returns complete proceeding history for a case (all statements in chronological order).
    /// 
    /// Sample: GET /api/casestatement/case/1
    /// </remarks>
    /// <param name="caseId">Case ID</param>
    /// <returns>List of case statements</returns>
    /// <response code="200">Returns case statements</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("case/{caseId}")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseStatementListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStatementsByCase(int caseId)
    {
        var result = await _casestatementService.GetStatementsByCaseAsync(caseId);

        return Ok(new
        {
            message = $"Case statements for case {caseId} retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get latest statement for a case.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge, Court Authority
    /// 
    /// Returns the most recent statement for a case (useful for checking verdict or latest proceeding).
    /// 
    /// Sample: GET /api/casestatement/case/1/latest
    /// </remarks>
    /// <param name="caseId">Case ID</param>
    /// <returns>Latest case statement</returns>
    /// <response code="200">Returns latest statement</response>
    /// <response code="404">No statements found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("case/{caseId}/latest")]
    [Authorize(Policy = "CourtRoles")]
    [ProducesResponseType(typeof(CaseStatementResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetLatestStatementForCase(int caseId)
    {
        var result = await _casestatementService.GetLatestStatementForCaseAsync(caseId);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "Latest case statement retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all case statements.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority
    /// 
    /// Returns all case statements across all cases.
    /// </remarks>
    /// <returns>List of all case statements</returns>
    /// <response code="200">Returns all statements</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(CaseStatementListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllCaseStatements()
    {
        var result = await _casestatementService.GetAllCaseStatementsAsync();

        return Ok(new
        {
            message = "All case statements retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    // ========================================================================
    // CASE STATEMENT UPDATE & DELETE
    // ========================================================================

    /// <summary>
    /// Update case statement (Judge only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge
    /// 
    /// Update existing case statement (typically before final verdict).
    /// Only the judge assigned to the case can update its statements.
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/casestatement/update
    ///     Authorization: Bearer {judge-token}
    ///     {
    ///         "statementId": 1,
    ///         "statementText": "Hearing conducted on 2025-10-07. [UPDATED] Additional evidence presented: Witness testimony from Officer Ahmed Khan confirming modified silencer detection. IoT device calibration certificate verified. Case adjourned for final arguments on 2025-11-20."
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Statement update details</param>
    /// <returns>Updated case statement</returns>
    /// <response code="200">Statement updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only assigned judge can update</response>
    /// <response code="404">Statement not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "JudgeOnly")]
    [ProducesResponseType(typeof(CaseStatementResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCaseStatement([FromBody] UpdateCaseStatementDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Case statement update attempt by Judge {UpdaterId} for Statement {StatementId}",
            updaterUserId, dto.StatementId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _casestatementService.UpdateCaseStatementAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Case statement update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Case statement updated successfully: {StatementId}", dto.StatementId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Delete case statement (Judge only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Judge
    /// 
    /// Delete a case statement (typically used to remove draft or incorrect statements before final verdict).
    /// Only the judge assigned to the case can delete its statements.
    /// 
    /// Sample: DELETE /api/casestatement/delete/1
    /// </remarks>
    /// <param name="id">Statement ID to delete</param>
    /// <returns>Success message</returns>
    /// <response code="200">Statement deleted successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only assigned judge can delete</response>
    /// <response code="404">Statement not found</response>
    [HttpDelete("delete/{id}")]
    [Authorize(Policy = "JudgeOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCaseStatement(int id)
    {
        var deleterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Case statement deletion attempt by Judge {DeleterId} for Statement {StatementId}",
            deleterUserId, id);

        var result = await _casestatementService.DeleteCaseStatementAsync(id, deleterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Case statement deletion failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("Case statement deleted successfully: {StatementId}", id);
        return Ok(new { message = result.Data });
    }
}