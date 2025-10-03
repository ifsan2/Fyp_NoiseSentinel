using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.Configuration;
using NoiseSentinel.BLL.DTOs.Auth;
using NoiseSentinel.BLL.Services.Interfaces;
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

/// <summary>
/// Service implementation for authentication and user management.
/// Handles user registration, login, password management, and JWT token generation.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IRoleRepository _roleRepository;
    private readonly IJudgeRepository _judgeRepository;
    private readonly IPoliceofficerRepository _policeofficerRepository;
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        UserManager<User> userManager,
        IRoleRepository roleRepository,
        IJudgeRepository judgeRepository,
        IPoliceofficerRepository policeofficerRepository,
        IUserRepository userRepository,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _roleRepository = roleRepository;
        _judgeRepository = judgeRepository;
        _policeofficerRepository = policeofficerRepository;
        _userRepository = userRepository;
        _jwtSettings = jwtSettings.Value;
    }

    /// <summary>
    /// Register a new Court Authority or Station Authority user.
    /// Validates role, creates user with Identity, and assigns role.
    /// </summary>
    public async Task<ServiceResult<AuthResponseDto>> RegisterAuthorityAsync(RegisterAuthorityDto dto)
    {
        // Validate role
        if (dto.Role != "Court Authority" && dto.Role != "Station Authority")
        {
            return ServiceResult<AuthResponseDto>.FailureResult(
                "Invalid role. Only Court Authority and Station Authority can self-register.");
        }

        // Check if user already exists
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

        // Get or create role in business table
        var role = await _roleRepository.GetByNameAsync(dto.Role);
        if (role == null)
        {
            role = new Role { RoleName = dto.Role };
            await _roleRepository.CreateAsync(role);
        }

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
                "User creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, dto.Role);

        // Generate JWT token
        var token = GenerateJwtToken(user, dto.Role);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName ?? string.Empty,
            Role = dto.Role,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(response, "Authority registered successfully.");
    }

    /// <summary>
    /// Create a Judge account. Only Court Authority users can create Judges.
    /// Creates User record and corresponding Judge record with additional details.
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateJudgeAsync(CreateJudgeDto dto, int creatorUserId)
    {
        // Verify creator is Court Authority
        var creator = await _userRepository.GetByIdAsync(creatorUserId);
        if (creator?.Role?.RoleName != "Court Authority")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Court Authority can create Judge accounts.");
        }

        // Check if user already exists
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

        // Get or create Judge role
        var role = await _roleRepository.GetByNameAsync("Judge");
        if (role == null)
        {
            role = new Role { RoleName = "Judge" };
            await _roleRepository.CreateAsync(role);
        }

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
                "User creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Judge");

        // Create Judge record
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
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName ?? string.Empty,
            Role = "Judge",
            Message = "Judge account created successfully."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    /// <summary>
    /// Create a Police Officer account. Only Station Authority users can create Police Officers.
    /// Creates User record and corresponding Policeofficer record with additional details.
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreatePoliceOfficerAsync(
        CreatePoliceOfficerDto dto, int creatorUserId)
    {
        // Verify creator is Station Authority
        var creator = await _userRepository.GetByIdAsync(creatorUserId);
        if (creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Only Station Authority can create Police Officer accounts.");
        }

        // Check if user already exists
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

        // Get or create Police Officer role
        var role = await _roleRepository.GetByNameAsync("Police Officer");
        if (role == null)
        {
            role = new Role { RoleName = "Police Officer" };
            await _roleRepository.CreateAsync(role);
        }

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
                "User creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Police Officer");

        // Create Police Officer record
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
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName ?? string.Empty,
            Role = "Police Officer",
            Message = "Police Officer account created successfully."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    /// <summary>
    /// Authenticate user and generate JWT token.
    /// Validates credentials and returns token with user information.
    /// </summary>
    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByNameAsync(dto.Username);
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

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        var roleName = roles.FirstOrDefault() ?? "Unknown";

        // Generate JWT token
        var token = GenerateJwtToken(user, roleName);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.UserName!,
            Email = user.Email!,
            FullName = user.FullName ?? string.Empty,
            Role = roleName,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(response, "Login successful.");
    }

    /// <summary>
    /// Change user password.
    /// Validates current password and updates to new password (must meet policy).
    /// </summary>
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

    /// <summary>
    /// Initialize system roles if they don't exist.
    /// Should be called on application startup.
    /// </summary>
    public async Task InitializeRolesAsync()
    {
        var roleNames = new[] { "Court Authority", "Station Authority", "Judge", "Police Officer" };

        foreach (var roleName in roleNames)
        {
            var existingRole = await _roleRepository.GetByNameAsync(roleName);
            if (existingRole == null)
            {
                var role = new Role { RoleName = roleName };
                await _roleRepository.CreateAsync(role);
            }
        }
    }

    /// <summary>
    /// Generate JWT token with user claims and role.
    /// Token includes UserId, Username, Email, and Role claims.
    /// </summary>
    private string GenerateJwtToken(User user, string role)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
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