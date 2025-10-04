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

    public AuthService(
        UserManager<User> userManager,
        RoleManager<ApplicationRole> roleManager,  
        IRoleRepository roleRepository,
        IJudgeRepository judgeRepository,
        IPoliceofficerRepository policeofficerRepository,
        IUserRepository userRepository,
        NoiseSentinelDbContext context,  
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _roleManager = roleManager;  
        _roleRepository = roleRepository;
        _judgeRepository = judgeRepository;
        _policeofficerRepository = policeofficerRepository;
        _userRepository = userRepository;
        _context = context;  
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<ServiceResult<AuthResponseDto>> RegisterAuthorityAsync(RegisterAuthorityDto dto)
    {
        if (dto.Role != "Court Authority" && dto.Role != "Station Authority")
        {
            return ServiceResult<AuthResponseDto>.FailureResult(
                "Invalid role. Only Court Authority and Station Authority can self-register.");
        }

        var existingUser = await _userManager.FindByNameAsync(dto.Username);
        if (existingUser != null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Username already exists.");
        }

        var existingEmail = await _userManager.FindByEmailAsync(dto.Email);
        if (existingEmail != null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Email already exists.");
        }

        var role = await _roleRepository.GetByNameAsync(dto.Role);
        if (role == null)
        {
            role = new Role { RoleName = dto.Role };
            await _roleRepository.CreateAsync(role);
        }

        //role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync(dto.Role);

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
                "User creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        var token = GenerateJwtToken(user, dto.Role);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = dto.Role,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(response, "Authority registered successfully.");
    }

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

        var existingUser = await _userManager.FindByNameAsync(dto.Username);
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult("Username already exists.");
        }

        var existingEmail = await _userManager.FindByEmailAsync(dto.Email);
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

        var existingUser = await _userManager.FindByNameAsync(dto.Username);
        if (existingUser != null)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult("Username already exists.");
        }

        var existingEmail = await _userManager.FindByEmailAsync(dto.Email);
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

    public async Task InitializeRolesAsync()
    {
        var roleNames = new[] { "Court Authority", "Station Authority", "Judge", "Police Officer" };

        foreach (var roleName in roleNames)
        {
            // Create in ROLE table
            var existingRole = await _roleRepository.GetByNameAsync(roleName);
            if (existingRole == null)
            {
                var role = new Role { RoleName = roleName };
                await _roleRepository.CreateAsync(role);
            }

            // Create in AspNetRoles table
            await EnsureIdentityRoleExistsAsync(roleName);
        }
    }

    // ✅ ADD THIS HELPER METHOD
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