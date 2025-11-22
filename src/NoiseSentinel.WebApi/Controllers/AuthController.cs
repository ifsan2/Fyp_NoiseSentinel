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
    private readonly IUserService _userService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IUserService userService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _userService = userService;
        _logger = logger;
    }

    // ========================================================================
    // ADMIN ENDPOINTS
    // ========================================================================

    /// <summary>
    /// Register first admin (public endpoint - only works if no admin exists).
    /// </summary>
    /// <remarks>
    /// **Public Endpoint - First Admin Bootstrap**
    /// 
    /// This endpoint is used for initial system setup to create the first admin account.
    /// After the first admin is created, this endpoint will reject all further registration attempts.
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/register/admin
    ///     {
    ///         "fullName": "System Administrator",
    ///         "email": "admin@noisesentinel.com",
    ///         "username": "admin",
    ///         "password": "Admin@1234",
    ///         "confirmPassword": "Admin@1234"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Admin registration details</param>
    /// <returns>Authentication response with JWT token</returns>
    /// <response code="200">First admin registered successfully, returns JWT token</response>
    /// <response code="400">Admin already exists or validation failed</response>
    [HttpPost("register/admin")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminDto dto)
    {
        _logger.LogInformation("Admin registration attempt for username: {Username}", dto.Username);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _authService.RegisterAdminAsync(dto);

        if (!result.Success)
        {
            _logger.LogWarning("Admin registration failed for {Username}: {Message}", dto.Username, result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("First admin registered successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Create additional admin account (Admin only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Admin role
    /// 
    /// Existing admin creates another admin account.
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/admin/create/admin
    ///     Authorization: Bearer {your-admin-token}
    ///     {
    ///         "fullName": "Secondary Admin",
    ///         "email": "admin2@noisesentinel.com",
    ///         "username": "admin2",
    ///         "password": "SecureAdmin@5678"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Admin creation details</param>
    /// <returns>Created admin information</returns>
    /// <response code="200">Admin created successfully</response>
    /// <response code="400">Validation failed or user already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Admin can create admins</response>
    [HttpPost("admin/create/admin")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(UserCreatedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Admin creation attempt by Admin {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _authService.CreateAdminAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Admin creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Admin created successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Admin account created successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Admin creates a Court Authority account.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Admin role
    /// 
    /// Admin creates a Court Authority who can then create Judge accounts.
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/admin/create/court-authority
    ///     Authorization: Bearer {your-admin-token}
    ///     {
    ///         "fullName": "Lahore High Court Admin",
    ///         "email": "lhc@court.gov.pk",
    ///         "username": "lhc_admin",
    ///         "password": "Court@1234"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Court Authority creation details</param>
    /// <returns>Created Court Authority information</returns>
    /// <response code="200">Court Authority created successfully</response>
    /// <response code="400">Validation failed or user already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Admin can create Court Authority</response>
    [HttpPost("admin/create/court-authority")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(UserCreatedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateCourtAuthority([FromBody] CreateCourtAuthorityDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Court Authority creation attempt by Admin {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _authService.CreateCourtAuthorityAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Court Authority creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Court Authority created successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Court Authority account created successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Admin creates a Station Authority account.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Admin role
    /// 
    /// Admin creates a Station Authority who can then create Police Officer accounts.
    /// 
    /// Sample request:
    /// 
    ///     POST /api/auth/admin/create/station-authority
    ///     Authorization: Bearer {your-admin-token}
    ///     {
    ///         "fullName": "Lahore Police Admin",
    ///         "email": "lahore@police.gov.pk",
    ///         "username": "lahore_station",
    ///         "password": "Station@1234"
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Station Authority creation details</param>
    /// <returns>Created Station Authority information</returns>
    /// <response code="200">Station Authority created successfully</response>
    /// <response code="400">Validation failed or user already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Admin can create Station Authority</response>
    [HttpPost("admin/create/station-authority")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(UserCreatedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateStationAuthority([FromBody] CreateStationAuthorityDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("Station Authority creation attempt by Admin {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _authService.CreateStationAuthorityAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("Station Authority creation failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("Station Authority created successfully: {Username}", dto.Username);
        return Ok(new
        {
            message = "Station Authority account created successfully",
            data = result.Data
        });
    }

    // ========================================================================
    // AUTHORITY USER CREATION ENDPOINTS
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
    ///     Authorization: Bearer {court-authority-token}
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
    ///     Authorization: Bearer {station-authority-token}
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
    ///         "username": "admin",
    ///         "password": "Admin@1234"
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

        _logger.LogInformation("Login successful for {Username}, Role: {Role}",
            dto.Username, result.Data?.Role);
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
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var result = await _userService.GetUserByIdAsync(int.Parse(userId));
        
        if (!result.Success)
        {
            return NotFound(new { message = result.Message, errors = result.Errors });
        }

        return Ok(new { message = "User profile retrieved successfully", data = result.Data });
    }
}