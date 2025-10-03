using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.Auth;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// Authentication and User Management Controller.
/// Handles user registration, login, account creation, and password management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    // ========================================================================
    // REGISTRATION ENDPOINTS
    // ========================================================================

    /// <summary>
    /// Register a new Court Authority user.
    /// </summary>
    /// <remarks>
    /// Sample request:
    /// 
    ///     POST /api/auth/register/court-authority
    ///     {
    ///         "fullName": "John Doe",
    ///         "email": "john.court@noisesentinel.com",
    ///         "username": "johndoe_court",
    ///         "password": "SecurePass@123",
    ///         "role": "Court Authority"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Court Authority registration details</param>
    /// <returns>Authentication response with JWT token</returns>
    /// <response code="200">Registration successful, returns user info and JWT token</response>
    /// <response code="400">Invalid request or validation failed</response>
    [HttpPost("register/court-authority")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterCourtAuthority([FromBody] RegisterAuthorityDto dto)
    {
        _logger.LogInformation("Court Authority registration attempt for username: {Username}", dto.Username);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        dto.Role = "Court Authority"; // Force role to Court Authority
        var result = await _authService.RegisterAuthorityAsync(dto);

        if (!result.Success)
        {
            _logger.LogWarning("Court Authority registration failed for {Username}: {Message}", dto.Username, result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Court Authority registered successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Court Authority registered successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Register a new Station Authority user.
    /// </summary>
    /// <remarks>
    /// Sample request:
    /// 
    ///     POST /api/auth/register/station-authority
    ///     {
    ///         "fullName": "Jane Smith",
    ///         "email": "jane.station@noisesentinel.com",
    ///         "username": "janesmith_station",
    ///         "password": "SecurePass@456",
    ///         "role": "Station Authority"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Station Authority registration details</param>
    /// <returns>Authentication response with JWT token</returns>
    /// <response code="200">Registration successful, returns user info and JWT token</response>
    /// <response code="400">Invalid request or validation failed</response>
    [HttpPost("register/station-authority")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterStationAuthority([FromBody] RegisterAuthorityDto dto)
    {
        _logger.LogInformation("Station Authority registration attempt for username: {Username}", dto.Username);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        dto.Role = "Station Authority"; // Force role to Station Authority
        var result = await _authService.RegisterAuthorityAsync(dto);

        if (!result.Success)
        {
            _logger.LogWarning("Station Authority registration failed for {Username}: {Message}", dto.Username, result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Station Authority registered successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Station Authority registered successfully",
            data = result.Data
        });
    }

    // ========================================================================
    // USER CREATION ENDPOINTS (BY AUTHORITIES)
    // ========================================================================

    /// <summary>
    /// Create a new Judge account (Court Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Court Authority role
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/create/judge
    ///     Authorization: Bearer {your-token}
    ///     {
    ///         "fullName": "Judge William Roberts",
    ///         "email": "w.roberts@court.gov",
    ///         "username": "judge_roberts",
    ///         "password": "JudgePass@789",
    ///         "cnic": "12345-6789012-3",
    ///         "contactNo": "+92-300-1234567",
    ///         "rank": "District Judge",
    ///         "courtId": 1,
    ///         "serviceStatus": true
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Judge account creation details</param>
    /// <returns>Created user information</returns>
    /// <response code="200">Judge created successfully</response>
    /// <response code="400">Invalid request or validation failed</response>
    /// <response code="401">Unauthorized - No valid token provided</response>
    /// <response code="403">Forbidden - Only Court Authority can create Judges</response>
    [HttpPost("create/judge")]
    [Authorize(Policy = "CourtAuthorityOnly")]
    [ProducesResponseType(typeof(UserCreatedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateJudge([FromBody] CreateJudgeDto dto)
    {
        _logger.LogInformation("Judge creation attempt by Court Authority: {CreatorId}", User.FindFirstValue(ClaimTypes.NameIdentifier));

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _authService.CreateJudgeAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Judge creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Judge created successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Judge account created successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Create a new Police Officer account (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/create/police-officer
    ///     Authorization: Bearer {your-token}
    ///     {
    ///         "fullName": "Officer Muhammad Ali",
    ///         "email": "m.ali@police.gov",
    ///         "username": "officer_ali",
    ///         "password": "OfficerPass@321",
    ///         "cnic": "42101-1234567-8",
    ///         "contactNo": "+92-301-7654321",
    ///         "badgeNumber": "PKL-2025-001",
    ///         "rank": "Sub-Inspector",
    ///         "isInvestigationOfficer": true,
    ///         "stationId": 1,
    ///         "postingDate": "2025-10-01T00:00:00Z"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Police Officer account creation details</param>
    /// <returns>Created user information</returns>
    /// <response code="200">Police Officer created successfully</response>
    /// <response code="400">Invalid request or validation failed</response>
    /// <response code="401">Unauthorized - No valid token provided</response>
    /// <response code="403">Forbidden - Only Station Authority can create Police Officers</response>
    [HttpPost("create/police-officer")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(UserCreatedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePoliceOfficer([FromBody] CreatePoliceOfficerDto dto)
    {
        _logger.LogInformation("Police Officer creation attempt by Station Authority: {CreatorId}", User.FindFirstValue(ClaimTypes.NameIdentifier));

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _authService.CreatePoliceOfficerAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Police Officer creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Police Officer created successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Police Officer account created successfully",
            data = result.Data
        });
    }

    // ========================================================================
    // LOGIN ENDPOINT
    // ========================================================================

    /// <summary>
    /// Login endpoint for all user roles.
    /// </summary>
    /// <remarks>
    /// Sample request:
    /// 
    ///     POST /api/auth/login
    ///     {
    ///         "username": "johndoe_court",
    ///         "password": "SecurePass@123"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Login credentials (username and password)</param>
    /// <returns>Authentication response with JWT token</returns>
    /// <response code="200">Login successful, returns user info and JWT token</response>
    /// <response code="400">Invalid credentials or account inactive</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        _logger.LogInformation("Login attempt for username: {Username}", dto.Username);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _authService.LoginAsync(dto);

        if (!result.Success)
        {
            _logger.LogWarning("Login failed for {Username}: {Message}", dto.Username, result.Message);
            return BadRequest(new
            {
                message = result.Message
            });
        }

        _logger.LogInformation("Login successful for {Username}", dto.Username);
        return Ok(new
        {
            message = "Login successful",
            data = result.Data
        });
    }

    // ========================================================================
    // PASSWORD MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Change password for authenticated user.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/change-password
    ///     Authorization: Bearer {your-token}
    ///     {
    ///         "currentPassword": "OldPassword@123",
    ///         "newPassword": "NewSecurePass@456",
    ///         "confirmPassword": "NewSecurePass@456"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Password change details</param>
    /// <returns>Success message</returns>
    /// <response code="200">Password changed successfully</response>
    /// <response code="400">Invalid current password or validation failed</response>
    /// <response code="401">Unauthorized - No valid token provided</response>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Password change attempt for user: {UserId}", userId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _authService.ChangePasswordAsync(dto, userId);

        if (!result.Success)
        {
            _logger.LogWarning("Password change failed for user {UserId}: {Message}", userId, result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
        return Ok(new
        {
            message = "Password changed successfully"
        });
    }

    // ========================================================================
    // USER INFO ENDPOINT
    // ========================================================================

    /// <summary>
    /// Get current authenticated user information.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Any authenticated user
    /// 
    /// Returns the profile information of the currently logged-in user.
    /// </remarks>
    /// <returns>Current user information</returns>
    /// <response code="200">Returns user information</response>
    /// <response code="401">Unauthorized - No valid token provided</response>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.Name);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var role = User.FindFirstValue(ClaimTypes.Role);

        return Ok(new
        {
            userId = int.Parse(userId!),
            username,
            email,
            role,
            claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }
}