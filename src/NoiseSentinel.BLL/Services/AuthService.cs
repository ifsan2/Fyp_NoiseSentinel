using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.Configuration;
using NoiseSentinel.BLL.DTOs.Auth;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IRoleRepository _roleRepository;
    private readonly IJudgeRepository _judgeRepository;
    private readonly IPoliceofficerRepository _policeofficerRepository;
    private readonly IUserRepository _userRepository;
    private readonly NoiseSentinelDbContext _context;
    private readonly JwtSettings _jwtSettings;

    private readonly ICourtService _courtService;

    public AuthService(
        UserManager<User> userManager,
        RoleManager<ApplicationRole> roleManager,
        IRoleRepository roleRepository,
        IJudgeRepository judgeRepository,
        IPoliceofficerRepository policeofficerRepository,
        IUserRepository userRepository,
        NoiseSentinelDbContext context,
        IOptions<JwtSettings> jwtSettings,
        ICourtService courtService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _roleRepository = roleRepository;
        _judgeRepository = judgeRepository;
        _policeofficerRepository = policeofficerRepository;
        _userRepository = userRepository;
        _context = context;
        _jwtSettings = jwtSettings.Value;
        _courtService = courtService;
    }

    // ========================================================================
    // ADMIN MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Register first admin (public endpoint - only works if no admin exists).
    /// </summary>
    public async Task<ServiceResult<AuthResponseDto>> RegisterAdminAsync(RegisterAdminDto dto)
    {
        // ✅ Check if any admin exists
        var adminRole = await _context.BusinessRoles
            .FirstOrDefaultAsync(r => r.RoleName == "Admin");

        if (adminRole != null)
        {
            var adminExists = await _context.Users
                .AnyAsync(u => u.RoleId == adminRole.RoleId);

            if (adminExists)
            {
                return ServiceResult<AuthResponseDto>.FailureResult(
                    "Admin already exists in the system. Please contact an existing administrator to create additional admin accounts.");
            }
        }

        // Check if username already exists
        var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
        if (existingUser != null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult(
                $"Username '{dto.Username}' is already taken.");
        }

        // Check if email already exists
        var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (existingEmail != null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult(
                $"Email '{dto.Email}' is already registered.");
        }

        // Get or create Admin role in ROLE table
        var role = await _roleRepository.GetByNameAsync("Admin");
        if (role == null)
        {
            role = new Role { RoleName = "Admin" };
            await _roleRepository.CreateAsync(role);
        }

        // Ensure Admin role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Admin");

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return ServiceResult<AuthResponseDto>.FailureResult(
                "Admin registration failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Admin");

        // Generate JWT token
        var token = GenerateJwtToken(user, "Admin");

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Admin",
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(
            response,
            "Admin registered successfully. You now have full system access.");
    }

    /// <summary>
    /// Create additional admin account (only by existing admin).
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateAdminAsync(CreateAdminDto dto, int creatorUserId)
    {
        // ✅ Verify creator is Admin
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Admin")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Admin users can create additional admin accounts.");
        }

        // Check username availability
        var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Username '{dto.Username}' is already taken.");
        }

        // Check email availability
        var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (existingEmail != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Email '{dto.Email}' is already registered.");
        }

        // Get Admin role
        var role = await _roleRepository.GetByNameAsync("Admin");
        if (role == null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Admin role does not exist in the system.");
        }

        // Ensure Admin role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Admin");

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Admin creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Admin");

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Admin",
            Message = $"Admin account '{dto.Username}' created successfully by {creator.NormalizedUserName}."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    /// <summary>
    /// Admin creates a Court Authority account.
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateCourtAuthorityAsync(
        CreateCourtAuthorityDto dto, int creatorUserId)
    {
        // ✅ Verify creator is Admin
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Admin")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Admin users can create Court Authority accounts.");
        }

        // Check username availability
        var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Username '{dto.Username}' is already taken.");
        }

        // Check email availability
        var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (existingEmail != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Email '{dto.Email}' is already registered.");
        }

        // Get Court Authority role
        var role = await _roleRepository.GetByNameAsync("Court Authority");
        if (role == null)
        {
            role = new Role { RoleName = "Court Authority" };
            await _roleRepository.CreateAsync(role);
        }

        // Ensure Court Authority role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Court Authority");

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Court Authority creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Court Authority");

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Court Authority",
            Message = $"Court Authority account '{dto.Username}' created successfully."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    /// <summary>
    /// Admin creates a Station Authority account.
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateStationAuthorityAsync(
        CreateStationAuthorityDto dto, int creatorUserId)
    {
        // ✅ Verify creator is Admin
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Admin")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Admin users can create Station Authority accounts.");
        }

        // Check username availability
        var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Username '{dto.Username}' is already taken.");
        }

        // Check email availability
        var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (existingEmail != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Email '{dto.Email}' is already registered.");
        }

        // Get Station Authority role
        var role = await _roleRepository.GetByNameAsync("Station Authority");
        if (role == null)
        {
            role = new Role { RoleName = "Station Authority" };
            await _roleRepository.CreateAsync(role);
        }

        // Ensure Station Authority role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Station Authority");

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Station Authority creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Station Authority");

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Station Authority",
            Message = $"Station Authority account '{dto.Username}' created successfully."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    // ========================================================================
    // AUTHORITY USER CREATION (Keep existing methods)
    // ========================================================================

    public async Task<ServiceResult<UserCreatedResponseDto>> CreateJudgeAsync(CreateJudgeDto dto, int creatorUserId)
    {
        // ✅ Load creator with Role navigation property
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Court Authority")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Court Authority can create Judge accounts.");
        }

        var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult("Username already exists.");
        }

        var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (existingEmail != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult("Email already exists.");
        }

        // ✅ Validate CourtId exists
        var courtExists = await _context.Courts.AnyAsync(c => c.CourtId == dto.CourtId);
        if (!courtExists)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Court with ID {dto.CourtId} does not exist.");
        }

        var role = await _roleRepository.GetByNameAsync("Judge");
        if (role == null)
        {
            role = new Role { RoleName = "Judge" };
            await _roleRepository.CreateAsync(role);
        }

        // ✅ Ensure role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Judge");

        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "User creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        await _userManager.AddToRoleAsync(user, "Judge");

        var judge = new Judge
        {
            UserId = user.Id,
            CourtId = dto.CourtId,
            Cnic = dto.Cnic,
            ContactNo = dto.ContactNo,
            Rank = dto.Rank,
            ServiceStatus = dto.ServiceStatus
        };

        await _judgeRepository.CreateAsync(judge);

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Judge",
            Message = "Judge account created successfully."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<UserCreatedResponseDto>> CreatePoliceOfficerAsync(
        CreatePoliceOfficerDto dto, int creatorUserId)
    {
        // ✅ Load creator with Role navigation property
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Station Authority can create Police Officer accounts.");
        }

        var existingUser = await _userManager.FindByNameAsync(dto.Username.ToUpperInvariant());
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult("Username already exists.");
        }

        var existingEmail = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (existingEmail != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult("Email already exists.");
        }

        // ✅ Validate StationId exists
        var stationExists = await _context.Policestations.AnyAsync(s => s.StationId == dto.StationId);
        if (!stationExists)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                $"Police Station with ID {dto.StationId} does not exist.");
        }

        var role = await _roleRepository.GetByNameAsync("Police Officer");
        if (role == null)
        {
            role = new Role { RoleName = "Police Officer" };
            await _roleRepository.CreateAsync(role);
        }

        // ✅ Ensure role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Police Officer");

        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "User creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        await _userManager.AddToRoleAsync(user, "Police Officer");

        var officer = new Policeofficer
        {
            UserId = user.Id,
            StationId = dto.StationId,
            Cnic = dto.Cnic,
            ContactNo = dto.ContactNo,
            BadgeNumber = dto.BadgeNumber,
            Rank = dto.Rank,
            IsInvestigationOfficer = dto.IsInvestigationOfficer,
            PostingDate = dto.PostingDate ?? DateTime.UtcNow
        };

        await _policeofficerRepository.CreateAsync(officer);

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Police Officer",
            Message = "Police Officer account created successfully."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var normalizedUsername = dto.Username.ToUpperInvariant();

        // ✅ Load user with Role navigation property
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.NormalizedUserName == normalizedUsername);

        if (user == null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Invalid username or password.");
        }

        if (user.IsActive == false)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("User account is deactivated.");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Invalid username or password.");
        }

        // ✅ Get role from loaded navigation property
        var roleName = user.Role?.RoleName ?? "Unknown";

        var token = GenerateJwtToken(user, roleName);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName ?? string.Empty,
            Email = user.NormalizedEmail ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            Role = roleName,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(response, "Login successful.");
    }

    public async Task<ServiceResult<string>> ChangePasswordAsync(ChangePasswordDto dto, int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return ServiceResult<string>.FailureResult("User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
        {
            return ServiceResult<string>.FailureResult(
                "Password change failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        return ServiceResult<string>.SuccessResult("Password changed successfully.");
    }

    // ========================================================================
    // SYSTEM INITIALIZATION
    // ========================================================================

    public async Task InitializeRolesAsync()
    {
        // ✅ Updated to include Admin role
        var roleNames = new[] { "Admin", "Court Authority", "Station Authority", "Judge", "Police Officer" };

        foreach (var roleName in roleNames)
        {
            // Create in ROLE table
            var existingRole = await _roleRepository.GetByNameAsync(roleName);
            if (existingRole == null)
            {
                var role = new Role { RoleName = roleName };
                await _roleRepository.CreateAsync(role);
                Console.WriteLine($"✓ Business role '{roleName}' created in ROLE table.");
            }

            // Create in AspNetRoles table
            await EnsureIdentityRoleExistsAsync(roleName);
        }

        await _courtService.InitializeCourtTypesAsync();
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private async Task EnsureIdentityRoleExistsAsync(string roleName)
    {
        var roleExists = await _roleManager.RoleExistsAsync(roleName);
        if (!roleExists)
        {
            var identityRole = new ApplicationRole
            {
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant()
            };
            await _roleManager.CreateAsync(identityRole);
            Console.WriteLine($"✓ Identity role '{roleName}' created in AspNetRoles table.");
        }
    }

    private string GenerateJwtToken(User user, string role)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.NormalizedUserName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.NormalizedEmail ?? string.Empty),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}