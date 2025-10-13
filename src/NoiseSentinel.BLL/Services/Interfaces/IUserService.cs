using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.User;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for user management operations.
/// </summary>
public interface IUserService
{
    // ========================================================================
    // USER VIEWING
    // ========================================================================
    
    /// <summary>
    /// Get all admin users.
    /// </summary>
    Task<ServiceResult<List<UserListItemDto>>> GetAllAdminsAsync();
    
    /// <summary>
    /// Get all court authority users.
    /// </summary>
    Task<ServiceResult<List<UserListItemDto>>> GetAllCourtAuthoritiesAsync();
    
    /// <summary>
    /// Get all station authority users.
    /// </summary>
    Task<ServiceResult<List<UserListItemDto>>> GetAllStationAuthoritiesAsync();
    
    /// <summary>
    /// Get all judges with court details.
    /// </summary>
    Task<ServiceResult<List<JudgeDetailsDto>>> GetAllJudgesAsync();
    
    /// <summary>
    /// Get all police officers with station details.
    /// </summary>
    Task<ServiceResult<List<PoliceOfficerDetailsDto>>> GetAllPoliceOfficersAsync();
    
    /// <summary>
    /// Get user details by ID.
    /// </summary>
    Task<ServiceResult<UserDetailsDto>> GetUserByIdAsync(int userId);
    
    /// <summary>
    /// Get user statistics/counts.
    /// </summary>
    Task<ServiceResult<UserCountsDto>> GetUserCountsAsync();
    
    // ========================================================================
    // USER SEARCHING
    // ========================================================================
    
    /// <summary>
    /// Search users with filters.
    /// </summary>
    Task<ServiceResult<List<UserListItemDto>>> SearchUsersAsync(UserSearchFilterDto filter);
    
    // ========================================================================
    // USER EDITING
    // ========================================================================
    
    /// <summary>
    /// Update admin/authority basic information.
    /// </summary>
    Task<ServiceResult<string>> UpdateUserAsync(int userId, UpdateUserDto dto);
    
    /// <summary>
    /// Update judge details.
    /// </summary>
    Task<ServiceResult<string>> UpdateJudgeAsync(int judgeId, UpdateJudgeDto dto);
    
    /// <summary>
    /// Update police officer details.
    /// </summary>
    Task<ServiceResult<string>> UpdatePoliceOfficerAsync(int officerId, UpdatePoliceOfficerDto dto);
    
    // ========================================================================
    // USER STATUS
    // ========================================================================
    
    /// <summary>
    /// Activate user account.
    /// </summary>
    Task<ServiceResult<string>> ActivateUserAsync(int userId);
    
    /// <summary>
    /// Deactivate user account.
    /// </summary>
    Task<ServiceResult<string>> DeactivateUserAsync(int userId);
    
    // ========================================================================
    // USER DELETION
    // ========================================================================
    
    /// <summary>
    /// Soft delete user (set IsActive = false).
    /// </summary>
    Task<ServiceResult<string>> DeleteUserAsync(int userId);
    
    /// <summary>
    /// Delete judge.
    /// </summary>
    Task<ServiceResult<string>> DeleteJudgeAsync(int judgeId);
    
    /// <summary>
    /// Delete police officer.
    /// </summary>
    Task<ServiceResult<string>> DeletePoliceOfficerAsync(int officerId);
}