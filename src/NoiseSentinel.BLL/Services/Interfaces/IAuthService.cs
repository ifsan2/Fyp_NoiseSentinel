using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Auth;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for authentication and user management operations.
/// </summary>
public interface IAuthService
{
    // ========================================================================
    // ADMIN MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Register first admin (public endpoint - only works if no admin exists).
    /// </summary>
    Task<ServiceResult<AuthResponseDto>> RegisterAdminAsync(RegisterAdminDto dto);

    /// <summary>
    /// Create additional admin account (only by existing admin).
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreateAdminAsync(CreateAdminDto dto, int creatorUserId);

    /// <summary>
    /// Admin creates a Court Authority account.
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreateCourtAuthorityAsync(CreateCourtAuthorityDto dto, int creatorUserId);

    /// <summary>
    /// Admin creates a Station Authority account.
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreateStationAuthorityAsync(CreateStationAuthorityDto dto, int creatorUserId);

    // ========================================================================
    // AUTHORITY USER CREATION
    // ========================================================================

    /// <summary>
    /// Create a Judge account (only by Court Authority).
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreateJudgeAsync(CreateJudgeDto dto, int creatorUserId);

    /// <summary>
    /// Create a Police Officer account (only by Station Authority).
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreatePoliceOfficerAsync(CreatePoliceOfficerDto dto, int creatorUserId);

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    /// <summary>
    /// Authenticate user and return JWT token.
    /// </summary>
    Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto);

    /// <summary>
    /// Change user password.
    /// </summary>
    Task<ServiceResult<AuthResponseDto>> ChangePasswordAsync(ChangePasswordDto dto, int userId);

    // ========================================================================
    // EMAIL VERIFICATION
    // ========================================================================

    /// <summary>
    /// Verify user email with OTP and return auth token for immediate login.
    /// </summary>
    Task<ServiceResult<AuthResponseDto>> VerifyEmailOtpAsync(VerifyOtpDto dto);

    /// <summary>
    /// Resend verification OTP to user email.
    /// </summary>
    Task<ServiceResult<string>> ResendVerificationOtpAsync(ResendOtpDto dto);

    // ========================================================================
    // SYSTEM INITIALIZATION
    // ========================================================================

    /// <summary>
    /// Initialize system roles.
    /// </summary>
    Task InitializeRolesAsync();
}