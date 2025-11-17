using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.User;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// User Management Controller for Admin and other authority operations.
/// Handles viewing, editing, searching, and managing all user types.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] 
[Produces("application/json")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    // ========================================================================
    // USER VIEWING ENDPOINTS
    // ========================================================================

    [HttpGet("admins")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(List<UserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAdmins()
    {
        _logger.LogInformation("Admin {UserId} requesting all admins", User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _userService.GetAllAdminsAsync();
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data, count = result.Data?.Count });
    }

    [HttpGet("court-authorities")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(List<UserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCourtAuthorities()
    {
        _logger.LogInformation("Admin {UserId} requesting all court authorities", User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _userService.GetAllCourtAuthoritiesAsync();
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data, count = result.Data?.Count });
    }

    [HttpGet("station-authorities")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(List<UserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStationAuthorities()
    {
        _logger.LogInformation("Admin {UserId} requesting all station authorities", User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _userService.GetAllStationAuthoritiesAsync();
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data, count = result.Data?.Count });
    }

    /// <summary>
    /// Get all judges - Admin OR Court Authority can access
    /// </summary>
    [HttpGet("judges")]
    [Authorize(Policy = "AdminOrCourtAuthority")]
    [ProducesResponseType(typeof(List<JudgeDetailsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllJudges()
    {
        _logger.LogInformation("User {UserId} requesting all judges", User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _userService.GetAllJudgesAsync();
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data, count = result.Data?.Count });
    }

    /// <summary>
    /// Get all police officers - Admin OR Station Authority can access
    /// </summary>
    [HttpGet("police-officers")]
    [Authorize(Policy = "AdminOrStationAuthority")]
    [ProducesResponseType(typeof(List<PoliceOfficerDetailsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPoliceOfficers()
    {
        _logger.LogInformation("User {UserId} requesting all police officers", User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _userService.GetAllPoliceOfficersAsync();
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data, count = result.Data?.Count });
    }

    /// <summary>
    /// Get user by ID - Any Authority role can access
    /// </summary>
    [HttpGet("{userId}")]
    [Authorize(Policy = "AuthorityRoles")]
    [ProducesResponseType(typeof(UserDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(int userId)
    {
        _logger.LogInformation("User {UserId} requesting user details for {TargetUserId}", User.FindFirstValue(ClaimTypes.NameIdentifier), userId);
        var result = await _userService.GetUserByIdAsync(userId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data });
    }

    [HttpGet("counts")]
    [Authorize(Policy = "AuthorityRoles")]
    [ProducesResponseType(typeof(UserCountsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserCounts()
    {
        _logger.LogInformation("User {UserId} requesting user counts", User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _userService.GetUserCountsAsync();
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data });
    }

    // ========================================================================
    // USER SEARCH & EDIT ENDPOINTS
    // ========================================================================

    [HttpGet("search")]
    [Authorize(Policy = "AuthorityRoles")]
    [ProducesResponseType(typeof(List<UserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchUsers([FromQuery] string? searchQuery, [FromQuery] string? role, [FromQuery] bool? isActive)
    {
        _logger.LogInformation("User {UserId} searching users: Query='{Query}', Role='{Role}', Active={Active}", User.FindFirstValue(ClaimTypes.NameIdentifier), searchQuery, role, isActive);
        var filter = new UserSearchFilterDto { SearchQuery = searchQuery, Role = role, IsActive = isActive };
        var result = await _userService.SearchUsersAsync(filter);
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message, data = result.Data, count = result.Data?.Count });
    }

    [HttpPut("{userId}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(new { message = "Validation failed", errors = ModelState });
        _logger.LogInformation("Admin {UserId} updating user {TargetUserId}", User.FindFirstValue(ClaimTypes.NameIdentifier), userId);
        var result = await _userService.UpdateUserAsync(userId, dto);
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Update a judge's details - Admin OR Court Authority can access
    /// </summary>
    [HttpPut("judges/{judgeId}")]
    [Authorize(Policy = "AdminOrCourtAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateJudge(int judgeId, [FromBody] UpdateJudgeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(new { message = "Validation failed", errors = ModelState });
        _logger.LogInformation("User {UserId} updating judge {JudgeId}", User.FindFirstValue(ClaimTypes.NameIdentifier), judgeId);
        var result = await _userService.UpdateJudgeAsync(judgeId, dto);
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Update police officer - Admin OR Station Authority can access
    /// </summary>
    [HttpPut("officers/{officerId}")]
    [Authorize(Policy = "AdminOrStationAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePoliceOfficer(int officerId, [FromBody] UpdatePoliceOfficerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(new { message = "Validation failed", errors = ModelState });
        _logger.LogInformation("User {UserId} updating police officer {OfficerId}", User.FindFirstValue(ClaimTypes.NameIdentifier), officerId);
        var result = await _userService.UpdatePoliceOfficerAsync(officerId, dto);
        if (!result.Success) return BadRequest(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    // ========================================================================
    // USER STATUS & DELETION ENDPOINTS
    // ========================================================================

    [HttpPut("{userId}/activate")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateUser(int userId)
    {
        _logger.LogInformation("Admin {UserId} activating user {TargetUserId}", User.FindFirstValue(ClaimTypes.NameIdentifier), userId);
        var result = await _userService.ActivateUserAsync(userId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    [HttpPut("{userId}/deactivate")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateUser(int userId)
    {
        _logger.LogInformation("Admin {UserId} deactivating user {TargetUserId}", User.FindFirstValue(ClaimTypes.NameIdentifier), userId);
        var result = await _userService.DeactivateUserAsync(userId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Activate a judge - Admin OR Court Authority can access
    /// </summary>
    [HttpPut("judges/{judgeId}/activate")]
    [Authorize(Policy = "AdminOrCourtAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateJudge(int judgeId)
    {
        _logger.LogInformation("User {UserId} activating judge {JudgeId}", User.FindFirstValue(ClaimTypes.NameIdentifier), judgeId);
        var result = await _userService.ActivateJudgeAsync(judgeId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Deactivate a judge - Admin OR Court Authority can access
    /// </summary>
    [HttpPut("judges/{judgeId}/deactivate")]
    [Authorize(Policy = "AdminOrCourtAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateJudge(int judgeId)
    {
        _logger.LogInformation("User {UserId} deactivating judge {JudgeId}", User.FindFirstValue(ClaimTypes.NameIdentifier), judgeId);
        var result = await _userService.DeactivateJudgeAsync(judgeId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Activate police officer - Admin OR Station Authority can access
    /// </summary>
    [HttpPut("officers/{officerId}/activate")]
    [Authorize(Policy = "AdminOrStationAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivatePoliceOfficer(int officerId)
    {
        _logger.LogInformation("User {UserId} activating police officer {OfficerId}", User.FindFirstValue(ClaimTypes.NameIdentifier), officerId);
        var result = await _userService.ActivatePoliceOfficerAsync(officerId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Deactivate police officer - Admin OR Station Authority can access
    /// </summary>
    [HttpPut("officers/{officerId}/deactivate")]
    [Authorize(Policy = "AdminOrStationAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivatePoliceOfficer(int officerId)
    {
        _logger.LogInformation("User {UserId} deactivating police officer {OfficerId}", User.FindFirstValue(ClaimTypes.NameIdentifier), officerId);
        var result = await _userService.DeactivatePoliceOfficerAsync(officerId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    [HttpDelete("{userId}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        _logger.LogInformation("Admin {UserId} deleting user {TargetUserId}", User.FindFirstValue(ClaimTypes.NameIdentifier), userId);
        var result = await _userService.DeleteUserAsync(userId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Delete a judge - Admin OR Court Authority can access
    /// </summary>
    [HttpDelete("judges/{judgeId}")]
    [Authorize(Policy = "AdminOrCourtAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteJudge(int judgeId)
    {
        _logger.LogInformation("User {UserId} deleting judge {JudgeId}", User.FindFirstValue(ClaimTypes.NameIdentifier), judgeId);
        var result = await _userService.DeleteJudgeAsync(judgeId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Delete police officer - Admin OR Station Authority can access
    /// </summary>
    [HttpDelete("officers/{officerId}")]
    [Authorize(Policy = "AdminOrStationAuthority")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePoliceOfficer(int officerId)
    {
        _logger.LogInformation("User {UserId} deleting police officer {OfficerId}", User.FindFirstValue(ClaimTypes.NameIdentifier), officerId);
        var result = await _userService.DeletePoliceOfficerAsync(officerId);
        if (!result.Success) return NotFound(new { message = result.Message, errors = result.Errors });
        return Ok(new { message = result.Message });
    }
}