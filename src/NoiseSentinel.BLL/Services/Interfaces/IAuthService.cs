using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Auth;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for authentication and user management operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Register a new Court Authority or Station Authority user.
    /// </summary>
    Task<ServiceResult<AuthResponseDto>> RegisterAuthorityAsync(RegisterAuthorityDto dto);

    /// <summary>
    /// Create a Judge account (only by Court Authority).
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreateJudgeAsync(CreateJudgeDto dto, int creatorUserId);

    /// <summary>
    /// Create a Police Officer account (only by Station Authority).
    /// </summary>
    Task<ServiceResult<UserCreatedResponseDto>> CreatePoliceOfficerAsync(CreatePoliceOfficerDto dto, int creatorUserId);

    /// <summary>
    /// Authenticate user and return JWT token.
    /// </summary>
    Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto);

    /// <summary>
    /// Change user password.
    /// </summary>
    Task<ServiceResult<string>> ChangePasswordAsync(ChangePasswordDto dto, int userId);

    /// <summary>
    /// Initialize system roles.
    /// </summary>
    Task InitializeRolesAsync();
}