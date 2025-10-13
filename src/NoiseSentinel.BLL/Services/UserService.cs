using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.User;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;

namespace NoiseSentinel.BLL.Services;

public class UserService : IUserService
{
    private readonly NoiseSentinelDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IUserRepository _userRepository;
    private readonly IJudgeRepository _judgeRepository;
    private readonly IPoliceofficerRepository _policeofficerRepository;

    public UserService(
        NoiseSentinelDbContext context,
        UserManager<User> userManager,
        IUserRepository userRepository,
        IJudgeRepository judgeRepository,
        IPoliceofficerRepository policeofficerRepository)
    {
        _context = context;
        _userManager = userManager;
        _userRepository = userRepository;
        _judgeRepository = judgeRepository;
        _policeofficerRepository = policeofficerRepository;
    }

    // ========================================================================
    // USER VIEWING
    // ========================================================================

    public async Task<ServiceResult<List<UserListItemDto>>> GetAllAdminsAsync()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role!.RoleName == "Admin")
                .OrderBy(u => u.FullName)
                .Select(u => new UserListItemDto
                {
                    UserId = u.Id,
                    Username = u.NormalizedUserName ?? string.Empty,
                    Email = u.NormalizedEmail ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    Role = u.Role!.RoleName ?? string.Empty,
                    IsActive = u.IsActive ?? true,
                    CreatedAt = u.CreatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return ServiceResult<List<UserListItemDto>>.SuccessResult(
                users,
                $"Retrieved {users.Count} admin(s).");
        }
        catch (Exception ex)
        {
            return ServiceResult<List<UserListItemDto>>.FailureResult(
                "Failed to retrieve admins.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<List<UserListItemDto>>> GetAllCourtAuthoritiesAsync()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role!.RoleName == "Court Authority")
                .OrderBy(u => u.FullName)
                .Select(u => new UserListItemDto
                {
                    UserId = u.Id,
                    Username = u.NormalizedUserName ?? string.Empty,
                    Email = u.NormalizedEmail ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    Role = u.Role!.RoleName ?? string.Empty,
                    IsActive = u.IsActive ?? true,
                    CreatedAt = u.CreatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return ServiceResult<List<UserListItemDto>>.SuccessResult(
                users,
                $"Retrieved {users.Count} court authorit(ies).");
        }
        catch (Exception ex)
        {
            return ServiceResult<List<UserListItemDto>>.FailureResult(
                "Failed to retrieve court authorities.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<List<UserListItemDto>>> GetAllStationAuthoritiesAsync()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role!.RoleName == "Station Authority")
                .OrderBy(u => u.FullName)
                .Select(u => new UserListItemDto
                {
                    UserId = u.Id,
                    Username = u.NormalizedUserName ?? string.Empty,
                    Email = u.NormalizedEmail ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    Role = u.Role!.RoleName ?? string.Empty,
                    IsActive = u.IsActive ?? true,
                    CreatedAt = u.CreatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return ServiceResult<List<UserListItemDto>>.SuccessResult(
                users,
                $"Retrieved {users.Count} station authorit(ies).");
        }
        catch (Exception ex)
        {
            return ServiceResult<List<UserListItemDto>>.FailureResult(
                "Failed to retrieve station authorities.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<List<JudgeDetailsDto>>> GetAllJudgesAsync()
    {
        try
        {
            var judges = await _context.Judges
                .Include(j => j.User)
                    .ThenInclude(u => u!.Role)
                .Include(j => j.Court)
                    .ThenInclude(c => c!.CourtType)
                .Where(j => j.User!.IsActive == true)
                .OrderBy(j => j.User!.FullName)
                .Select(j => new JudgeDetailsDto
                {
                    JudgeId = j.JudgeId,
                    UserId = j.UserId ?? 0,
                    Username = j.User!.NormalizedUserName ?? string.Empty,
                    Email = j.User.NormalizedEmail ?? string.Empty,
                    FullName = j.User.FullName ?? string.Empty,
                    Cnic = j.Cnic ?? string.Empty,
                    ContactNo = j.ContactNo ?? string.Empty,
                    Rank = j.Rank ?? string.Empty,
                    ServiceStatus = j.ServiceStatus ?? false,
                    IsActive = j.User.IsActive ?? true,
                    CourtId = j.CourtId ?? 0,
                    CourtName = j.Court!.CourtName ?? string.Empty,
                    CourtLocation = j.Court.Location ?? string.Empty,
                    CourtType = j.Court.CourtType!.CourtTypeName ?? string.Empty,
                    TotalCases = _context.Cases.Count(c => c.JudgeId == j.JudgeId)
                })
                .ToListAsync();

            return ServiceResult<List<JudgeDetailsDto>>.SuccessResult(
                judges,
                $"Retrieved {judges.Count} judge(s).");
        }
        catch (Exception ex)
        {
            return ServiceResult<List<JudgeDetailsDto>>.FailureResult(
                "Failed to retrieve judges.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<List<PoliceOfficerDetailsDto>>> GetAllPoliceOfficersAsync()
    {
        try
        {
            var officers = await _context.Policeofficers
                .Include(o => o.User)
                    .ThenInclude(u => u!.Role)
                .Include(o => o.Station)
                .Where(o => o.User!.IsActive == true)
                .OrderBy(o => o.User!.FullName)
                .Select(o => new PoliceOfficerDetailsDto
                {
                    OfficerId = o.OfficerId,
                    UserId = o.UserId ?? 0,
                    Username = o.User!.NormalizedUserName ?? string.Empty,
                    Email = o.User.NormalizedEmail ?? string.Empty,
                    FullName = o.User.FullName ?? string.Empty,
                    Cnic = o.Cnic ?? string.Empty,
                    ContactNo = o.ContactNo ?? string.Empty,
                    BadgeNumber = o.BadgeNumber ?? string.Empty,
                    Rank = o.Rank ?? string.Empty,
                    IsInvestigationOfficer = o.IsInvestigationOfficer ?? false,
                    PostingDate = o.PostingDate ?? DateTime.UtcNow,
                    IsActive = o.User.IsActive ?? true,
                    StationId = o.StationId ?? 0,
                    StationName = o.Station!.StationName ?? string.Empty,
                    StationLocation = o.Station.Location ?? string.Empty,
                    StationCode = o.Station.StationCode ?? string.Empty,
                    TotalChallans = _context.Challans.Count(c => c.OfficerId == o.OfficerId)
                })
                .ToListAsync();

            return ServiceResult<List<PoliceOfficerDetailsDto>>.SuccessResult(
                officers,
                $"Retrieved {officers.Count} police officer(s).");
        }
        catch (Exception ex)
        {
            return ServiceResult<List<PoliceOfficerDetailsDto>>.FailureResult(
                "Failed to retrieve police officers.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<UserDetailsDto>> GetUserByIdAsync(int userId)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ServiceResult<UserDetailsDto>.FailureResult(
                    $"User with ID {userId} not found.");
            }

            var userDetails = new UserDetailsDto
            {
                UserId = user.Id,
                Username = user.NormalizedUserName ?? string.Empty,
                Email = user.NormalizedEmail ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Role = user.Role!.RoleName ?? string.Empty,
                IsActive = user.IsActive ?? true,
                CreatedAt = user.CreatedAt ?? DateTime.UtcNow,
                RoleId = user.RoleId,
                RoleName = user.Role.RoleName
            };

            // Get role-specific details
            if (user.Role.RoleName == "Judge")
            {
                var judge = await _context.Judges
                    .Include(j => j.Court)
                        .ThenInclude(c => c!.CourtType)
                    .FirstOrDefaultAsync(j => j.UserId == userId);

                if (judge != null)
                {
                    userDetails.JudgeId = judge.JudgeId;
                    userDetails.Cnic = judge.Cnic;
                    userDetails.ContactNo = judge.ContactNo;
                    userDetails.Rank = judge.Rank;
                    userDetails.CourtId = judge.CourtId;
                    userDetails.CourtName = judge.Court!.CourtName;
                    userDetails.CourtLocation = judge.Court.Location;
                    userDetails.CourtType = judge.Court.CourtType!.CourtTypeName;
                }
            }
            else if (user.Role.RoleName == "Police Officer")
            {
                var officer = await _context.Policeofficers
                    .Include(o => o.Station)
                    .FirstOrDefaultAsync(o => o.UserId == userId);

                if (officer != null)
                {
                    userDetails.OfficerId = officer.OfficerId;
                    userDetails.Cnic = officer.Cnic;
                    userDetails.ContactNo = officer.ContactNo;
                    userDetails.BadgeNumber = officer.BadgeNumber;
                    userDetails.Rank = officer.Rank;
                    userDetails.IsInvestigationOfficer = officer.IsInvestigationOfficer ?? false;
                    userDetails.StationId = officer.StationId;
                    userDetails.StationName = officer.Station!.StationName;
                    userDetails.StationLocation = officer.Station.Location;
                    userDetails.StationCode = officer.Station.StationCode;
                    userDetails.PostingDate = officer.PostingDate;
                }
            }

            return ServiceResult<UserDetailsDto>.SuccessResult(userDetails);
        }
        catch (Exception ex)
        {
            return ServiceResult<UserDetailsDto>.FailureResult(
                "Failed to retrieve user details.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<UserCountsDto>> GetUserCountsAsync()
    {
        try
        {
            var counts = new UserCountsDto
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalAdmins = await _context.Users
                    .Include(u => u.Role)
                    .CountAsync(u => u.Role!.RoleName == "Admin"),
                TotalCourtAuthorities = await _context.Users
                    .Include(u => u.Role)
                    .CountAsync(u => u.Role!.RoleName == "Court Authority"),
                TotalStationAuthorities = await _context.Users
                    .Include(u => u.Role)
                    .CountAsync(u => u.Role!.RoleName == "Station Authority"),
                TotalJudges = await _context.Judges.CountAsync(),
                TotalPoliceOfficers = await _context.Policeofficers.CountAsync(),
                ActiveUsers = await _context.Users.CountAsync(u => u.IsActive == true),
                InactiveUsers = await _context.Users.CountAsync(u => u.IsActive == false || u.IsActive == null)
            };

            return ServiceResult<UserCountsDto>.SuccessResult(counts);
        }
        catch (Exception ex)
        {
            return ServiceResult<UserCountsDto>.FailureResult(
                "Failed to retrieve user counts.",
                new List<string> { ex.Message });
        }
    }

    // ========================================================================
    // USER SEARCHING
    // ========================================================================

    public async Task<ServiceResult<List<UserListItemDto>>> SearchUsersAsync(UserSearchFilterDto filter)
    {
        try
        {
            var query = _context.Users
                .Include(u => u.Role)
                .AsQueryable();

            // Apply search query
            if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
            {
                var searchTerm = filter.SearchQuery.ToUpperInvariant();
                query = query.Where(u =>
                    (u.NormalizedUserName != null && u.NormalizedUserName.Contains(searchTerm)) ||
                    (u.NormalizedEmail != null && u.NormalizedEmail.Contains(searchTerm)) ||
                    (u.FullName != null && u.FullName.ToUpper().Contains(searchTerm)));
            }

            // Apply role filter
            if (!string.IsNullOrWhiteSpace(filter.Role))
            {
                query = query.Where(u => u.Role!.RoleName == filter.Role);
            }

            // Apply status filter
            if (filter.IsActive.HasValue)
            {
                query = query.Where(u => u.IsActive == filter.IsActive.Value);
            }

            var users = await query
                .OrderBy(u => u.FullName)
                .Select(u => new UserListItemDto
                {
                    UserId = u.Id,
                    Username = u.NormalizedUserName ?? string.Empty,
                    Email = u.NormalizedEmail ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    Role = u.Role!.RoleName ?? string.Empty,
                    IsActive = u.IsActive ?? true,
                    CreatedAt = u.CreatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return ServiceResult<List<UserListItemDto>>.SuccessResult(
                users,
                $"Found {users.Count} user(s) matching criteria.");
        }
        catch (Exception ex)
        {
            return ServiceResult<List<UserListItemDto>>.FailureResult(
                "Failed to search users.",
                new List<string> { ex.Message });
        }
    }

    // ========================================================================
    // USER EDITING
    // ========================================================================

    public async Task<ServiceResult<string>> UpdateUserAsync(int userId, UpdateUserDto dto)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ServiceResult<string>.FailureResult($"User with ID {userId} not found.");
            }

            // Check if user is Admin, Court Authority, or Station Authority
            if (user.Role!.RoleName != "Admin" &&
                user.Role.RoleName != "Court Authority" &&
                user.Role.RoleName != "Station Authority")
            {
                return ServiceResult<string>.FailureResult(
                    "This endpoint is only for Admin, Court Authority, and Station Authority users.");
            }

            // Check if username is already taken by another user
            if (user.NormalizedUserName != dto.Username.ToUpperInvariant())
            {
                var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
                if (existingUser != null && existingUser.Id != userId)
                {
                    return ServiceResult<string>.FailureResult($"Username '{dto.Username}' is already taken.");
                }
            }

            // Check if email is already taken by another user
            if (user.NormalizedEmail != dto.Email.ToUpperInvariant())
            {
                var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
                if (existingEmail != null && existingEmail.Id != userId)
                {
                    return ServiceResult<string>.FailureResult($"Email '{dto.Email}' is already registered.");
                }
            }

            // Update user
            user.FullName = dto.FullName;
            user.NormalizedEmail = dto.Email.ToUpperInvariant();
            user.NormalizedUserName = dto.Username.ToUpperInvariant();

            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult(
                $"User '{dto.Username}' updated successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to update user.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<string>> UpdateJudgeAsync(int judgeId, UpdateJudgeDto dto)
    {
        try
        {
            var judge = await _context.Judges
                .Include(j => j.User)
                .FirstOrDefaultAsync(j => j.JudgeId == judgeId);

            if (judge == null)
            {
                return ServiceResult<string>.FailureResult($"Judge with ID {judgeId} not found.");
            }

            // Update User info
            judge.User!.FullName = dto.FullName;
            judge.User.NormalizedEmail = dto.Email.ToUpperInvariant();

            // Update Judge-specific info
            judge.Cnic = dto.Cnic;
            judge.ContactNo = dto.ContactNo;
            judge.Rank = dto.Rank;

            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult($"Judge '{dto.FullName}' updated successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to update judge.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<string>> UpdatePoliceOfficerAsync(int officerId, UpdatePoliceOfficerDto dto)
    {
        try
        {
            var officer = await _context.Policeofficers
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OfficerId == officerId);

            if (officer == null)
            {
                return ServiceResult<string>.FailureResult($"Police Officer with ID {officerId} not found.");
            }

            // Update User info
            officer.User!.FullName = dto.FullName;
            officer.User.NormalizedEmail = dto.Email.ToUpperInvariant();

            // Update Officer-specific info
            officer.Cnic = dto.Cnic;
            officer.ContactNo = dto.ContactNo;
            officer.BadgeNumber = dto.BadgeNumber;
            officer.Rank = dto.Rank;
            officer.IsInvestigationOfficer = dto.IsInvestigationOfficer;

            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult($"Police Officer '{dto.FullName}' updated successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to update police officer.",
                new List<string> { ex.Message });
        }
    }

    // ========================================================================
    // USER STATUS
    // ========================================================================

    public async Task<ServiceResult<string>> ActivateUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return ServiceResult<string>.FailureResult($"User with ID {userId} not found.");
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult($"User '{user.NormalizedUserName}' activated successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to activate user.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<string>> DeactivateUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return ServiceResult<string>.FailureResult($"User with ID {userId} not found.");
            }

            user.IsActive = false;
            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult($"User '{user.NormalizedUserName}' deactivated successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to deactivate user.",
                new List<string> { ex.Message });
        }
    }

    // ========================================================================
    // USER DELETION
    // ========================================================================

    public async Task<ServiceResult<string>> DeleteUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ServiceResult<string>.FailureResult($"User with ID {userId} not found.");
            }

            // Soft delete (set IsActive = false)
            user.IsActive = false;
            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult(
                $"User '{user.NormalizedUserName}' deleted (deactivated) successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to delete user.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<string>> DeleteJudgeAsync(int judgeId)
    {
        try
        {
            var judge = await _context.Judges
                .Include(j => j.User)
                .FirstOrDefaultAsync(j => j.JudgeId == judgeId);

            if (judge == null)
            {
                return ServiceResult<string>.FailureResult($"Judge with ID {judgeId} not found.");
            }

            // Soft delete user account
            judge.User!.IsActive = false;
            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult(
                $"Judge '{judge.User.NormalizedUserName}' deleted (deactivated) successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to delete judge.",
                new List<string> { ex.Message });
        }
    }

    public async Task<ServiceResult<string>> DeletePoliceOfficerAsync(int officerId)
    {
        try
        {
            var officer = await _context.Policeofficers
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OfficerId == officerId);

            if (officer == null)
            {
                return ServiceResult<string>.FailureResult($"Police Officer with ID {officerId} not found.");
            }

            // Soft delete user account
            officer.User!.IsActive = false;
            await _context.SaveChangesAsync();

            return ServiceResult<string>.SuccessResult(
                $"Police Officer '{officer.User.NormalizedUserName}' deleted (deactivated) successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to delete police officer.",
                new List<string> { ex.Message });
        }
    }
}