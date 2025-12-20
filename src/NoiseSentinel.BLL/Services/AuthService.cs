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
    private readonly EmailSettings _emailSettings;
    private readonly IEmailService _emailService;
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
        IOptions<EmailSettings> emailSettings,
        IEmailService emailService,
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
        _emailSettings = emailSettings.Value;
        _emailService = emailService;
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
        // ✅ Check if any ACTIVE admin exists (don't count unverified admins)
        var adminRole = await _context.BusinessRoles
            .FirstOrDefaultAsync(r => r.RoleName == "Admin");

        if (adminRole != null)
        {
            var adminExists = await _context.Users
                .AnyAsync(u => u.RoleId == adminRole.RoleId && u.EmailVerifiedAt.HasValue);

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
            IsActive = false, // ✅ Will be set to true after email verification
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

        // Send email verification
        try
        {
            await SendVerificationEmailAsync(user);
        }
        catch (Exception ex)
        {
            // Log but don't fail registration if email sending fails
            // In production, you might want to queue this for retry
            Console.WriteLine($"Failed to send verification email: {ex.Message}");
        }

        // ✅ DO NOT GENERATE TOKEN - User must verify email first
        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Admin",
            Token = string.Empty, // No token until email is verified
            ExpiresAt = DateTime.UtcNow
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(
            response,
            "Admin registered successfully. Please check your email to verify your account before logging in.");
    }

    /// <summary>
    /// Create additional admin account (only by existing admin).
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateAdminAsync(CreateAdminDto dto, int creatorUserId)
    {
        // ? Verify creator is Admin
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

        // ✅ Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = false, // ✅ Will be set to true after email verification
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId,
            IsFirstLogin = true,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, temporaryPassword);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Admin creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Admin");

        // ✅ Generate OTP for email verification
        var otp = GenerateOtp();
        var otpExpiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);
        await _userRepository.UpdateEmailVerificationAsync(user, otp, otpExpiresAt);

        // ✅ Send combined email with OTP and temporary password
        try
        {
            await _emailService.SendAccountCreationEmailAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp,
                temporaryPassword,
                "Admin");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send account creation email: {ex.Message}");
        }

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Admin",
            Message = $"Admin account '{dto.Username}' created successfully. Temporary password sent to email."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    /// <summary>
    /// Admin creates a Court Authority account.
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateCourtAuthorityAsync(
        CreateCourtAuthorityDto dto, int creatorUserId)
    {
        // ? Verify creator is Admin
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

        // ✅ Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = false, // ✅ Will be set to true after email verification
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId,
            IsFirstLogin = true,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, temporaryPassword);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Court Authority creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Court Authority");

        // ✅ Generate OTP for email verification
        var otp = GenerateOtp();
        var otpExpiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);
        await _userRepository.UpdateEmailVerificationAsync(user, otp, otpExpiresAt);

        // ✅ Send combined email with OTP and temporary password
        try
        {
            await _emailService.SendAccountCreationEmailAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp,
                temporaryPassword,
                "Court Authority");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send account creation email: {ex.Message}");
        }

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Court Authority",
            Message = $"Court Authority account created successfully. Temporary password sent to email."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    /// <summary>
    /// Admin creates a Station Authority account.
    /// </summary>
    public async Task<ServiceResult<UserCreatedResponseDto>> CreateStationAuthorityAsync(
        CreateStationAuthorityDto dto, int creatorUserId)
    {
        // ? Verify creator is Admin
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

        // ✅ Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        // Create user
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = false, // ✅ Will be set to true after email verification
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId,
            IsFirstLogin = true,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, temporaryPassword);

        if (!result.Succeeded)
        {
            return ServiceResult<UserCreatedResponseDto>.FailureResult(
                "Station Authority creation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // Add to Identity role
        await _userManager.AddToRoleAsync(user, "Station Authority");

        // ✅ Generate OTP for email verification
        var otp = GenerateOtp();
        var otpExpiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);
        await _userRepository.UpdateEmailVerificationAsync(user, otp, otpExpiresAt);

        // ✅ Send combined email with OTP and temporary password
        try
        {
            await _emailService.SendAccountCreationEmailAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp,
                temporaryPassword,
                "Station Authority");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send account creation email: {ex.Message}");
        }

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Station Authority",
            Message = $"Station Authority account created successfully. Temporary password sent to email."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    // ========================================================================
    // AUTHORITY USER CREATION (Keep existing methods)
    // ========================================================================

    public async Task<ServiceResult<UserCreatedResponseDto>> CreateJudgeAsync(CreateJudgeDto dto, int creatorUserId)
    {
        // ? Load creator with Role navigation property
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

        // ? Validate CourtId exists
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

        // ? Ensure role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Judge");

        // ✅ Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = false, // ✅ Will be set to true after email verification
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId,
            IsFirstLogin = true,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, temporaryPassword);

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

        // ✅ Generate OTP for email verification
        var otp = GenerateOtp();
        var otpExpiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);
        await _userRepository.UpdateEmailVerificationAsync(user, otp, otpExpiresAt);

        // ✅ Send combined email with OTP and temporary password
        try
        {
            await _emailService.SendAccountCreationEmailAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp,
                temporaryPassword,
                "Judge");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send account creation email: {ex.Message}");
        }

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Judge",
            Message = "Judge account created successfully. Temporary password sent to email."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<UserCreatedResponseDto>> CreatePoliceOfficerAsync(
        CreatePoliceOfficerDto dto, int creatorUserId)
    {
        // ? Load creator with Role navigation property
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

        // ? Validate StationId exists
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

        // ? Ensure role exists in AspNetRoles
        await EnsureIdentityRoleExistsAsync("Police Officer");

        // ✅ Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            IsActive = false, // ✅ Will be set to true after email verification
            CreatedAt = DateTime.UtcNow,
            RoleId = role.RoleId,
            IsFirstLogin = true,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, temporaryPassword);

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

        // ✅ Generate OTP for email verification
        var otp = GenerateOtp();
        var otpExpiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);
        await _userRepository.UpdateEmailVerificationAsync(user, otp, otpExpiresAt);

        // ✅ Send combined email with OTP and temporary password
        try
        {
            await _emailService.SendAccountCreationEmailAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp,
                temporaryPassword,
                "Police Officer");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send account creation email: {ex.Message}");
        }

        var response = new UserCreatedResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName!,
            Email = user.NormalizedEmail!,
            FullName = user.FullName ?? string.Empty,
            Role = "Police Officer",
            Message = "Police Officer account created successfully. Temporary password sent to email."
        };

        return ServiceResult<UserCreatedResponseDto>.SuccessResult(response);
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var normalizedInput = dto.Username.ToUpperInvariant();

        // ? Load user with Role navigation property
        // Check if input is username or email
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => 
                u.NormalizedUserName == normalizedInput || 
                u.NormalizedEmail == normalizedInput);

        if (user == null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Invalid username/email or password.");
        }

        // ✅ Check password FIRST before any other validation
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Invalid username/email or password.");
        }

        // ? Get role from loaded navigation property
        var roleName = user.Role?.RoleName ?? "Unknown";

        // ✅ SECURITY FIX: Block login if email not verified
        var requiresEmailVerification = !user.EmailVerifiedAt.HasValue;

        if (requiresEmailVerification)
        {
            // Return response WITHOUT token - user must verify email first
            var unverifiedResponse = new AuthResponseDto
            {
                UserId = user.Id,
                Username = user.NormalizedUserName ?? string.Empty,
                Email = user.NormalizedEmail ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Role = roleName,
                Token = string.Empty, // No token for unverified users
                ExpiresAt = DateTime.UtcNow,
                MustChangePassword = user.MustChangePassword,
                IsFirstLogin = user.IsFirstLogin,
                RequiresEmailVerification = true
            };

            return ServiceResult<AuthResponseDto>.SuccessResult(
                unverifiedResponse, 
                "Please verify your email before logging in. Check your inbox for the verification code.");
        }

        // ✅ NOW check if account is deactivated (after email is verified)
        if (user.IsActive == false)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Your account has been deactivated. Please contact an administrator.");
        }

        // ✅ Email verified - generate token
        var token = GenerateJwtToken(user, roleName);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName ?? string.Empty,
            Email = user.NormalizedEmail ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            Role = roleName,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            MustChangePassword = user.MustChangePassword,
            IsFirstLogin = user.IsFirstLogin,
            RequiresEmailVerification = false
        };

        var message = user.MustChangePassword 
            ? "Login successful. You must change your password." 
            : "Login successful.";

        return ServiceResult<AuthResponseDto>.SuccessResult(response, message);
    }

    public async Task<ServiceResult<AuthResponseDto>> ChangePasswordAsync(ChangePasswordDto dto, int userId)
    {
        // ✅ Use UserManager to find user (ensures proper Identity context)
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("User not found.");
        }

        // ✅ Ensure SecurityStamp is set (required for password operations)
        if (string.IsNullOrEmpty(user.SecurityStamp))
        {
            user.SecurityStamp = Guid.NewGuid().ToString();
            await _userManager.UpdateAsync(user);
        }

        // Load role separately
        var userWithRole = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        var roleName = userWithRole?.Role?.RoleName ?? "Unknown";

        IdentityResult result;

        // ✅ For forced password change (after OTP verification), remove old password and set new one
        if (dto.IsForcedChange && user.MustChangePassword)
        {
            // ✅ Use RemovePasswordAsync + AddPasswordAsync instead of reset token (more reliable)
            var removeResult = await _userManager.RemovePasswordAsync(user);
            if (!removeResult.Succeeded)
            {
                return ServiceResult<AuthResponseDto>.FailureResult(
                    "Failed to remove old password.",
                    removeResult.Errors.Select(e => e.Description).ToList());
            }
            
            result = await _userManager.AddPasswordAsync(user, dto.NewPassword);
        }
        else
        {
            // Normal password change - requires current password
            if (string.IsNullOrEmpty(dto.CurrentPassword))
            {
                return ServiceResult<AuthResponseDto>.FailureResult("Current password is required for normal password changes.");
            }
            result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword!, dto.NewPassword);
        }

        if (!result.Succeeded)
        {
            return ServiceResult<AuthResponseDto>.FailureResult(
                "Password change failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        // ✅ Update password management flags
        user.MustChangePassword = false;
        user.IsFirstLogin = false;
        user.LastPasswordChangedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // ✅ Generate new token after password change
        var newToken = GenerateJwtToken(user, roleName);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName ?? string.Empty,
            Email = user.NormalizedEmail ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            Role = roleName,
            Token = newToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            MustChangePassword = false,
            IsFirstLogin = false,
            RequiresEmailVerification = false
        };

        return ServiceResult<AuthResponseDto>.SuccessResult(response, "Password changed successfully.");
    }

    // ========================================================================
    // SYSTEM INITIALIZATION
    // ========================================================================

    public async Task InitializeRolesAsync()
    {
        // ? Updated to include Admin role
        var roleNames = new[] { "Admin", "Court Authority", "Station Authority", "Judge", "Police Officer" };

        foreach (var roleName in roleNames)
        {
            // Create in ROLE table
            var existingRole = await _roleRepository.GetByNameAsync(roleName);
            if (existingRole == null)
            {
                var role = new Role { RoleName = roleName };
                await _roleRepository.CreateAsync(role);
                Console.WriteLine($"? Business role '{roleName}' created in ROLE table.");
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
            Console.WriteLine($"? Identity role '{roleName}' created in AspNetRoles table.");
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

    // ========================================================================
    // EMAIL VERIFICATION METHODS
    // ========================================================================

    /// <summary>
    /// Verify user email with OTP.
    /// </summary>
    public async Task<ServiceResult<AuthResponseDto>> VerifyEmailOtpAsync(VerifyOtpDto dto)
    {
        // Find user by email
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == dto.Email.ToUpperInvariant());

        if (user == null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("User not found.");
        }

        // Check if already verified
        if (user.EmailVerifiedAt.HasValue)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Email is already verified.");
        }

        // Validate OTP
        if (user.EmailVerificationOtp != dto.Otp)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("Invalid OTP.");
        }

        // Check OTP expiration
        if (user.OtpExpiresAt == null || user.OtpExpiresAt < DateTime.UtcNow)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("OTP has expired. Please request a new one.");
        }

        // Mark email as verified (this also sets IsActive = true)
        await _userRepository.MarkEmailAsVerifiedAsync(user.Id);

        // Reload user to get updated IsActive status
        user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        if (user == null || user.Role == null)
        {
            return ServiceResult<AuthResponseDto>.FailureResult("User data could not be retrieved.");
        }

        var roleName = user.Role.RoleName ?? "User";

        // ✅ Generate JWT token for immediate login
        var token = GenerateJwtToken(user, roleName);

        // Send welcome email
        try
        {
            await _emailService.SendWelcomeEmailAsync(user.NormalizedEmail!, user.FullName ?? "User");
        }
        catch (Exception)
        {
            // Log but don't fail the verification if welcome email fails
        }

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.NormalizedUserName ?? string.Empty,
            Email = user.NormalizedEmail ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            Role = roleName,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            MustChangePassword = user.MustChangePassword,
            IsFirstLogin = user.IsFirstLogin,
            RequiresEmailVerification = false
        };

        var message = user.MustChangePassword
            ? "Email verified successfully! You must change your password."
            : "Email verified successfully!";

        return ServiceResult<AuthResponseDto>.SuccessResult(response, message);
    }

    /// <summary>
    /// Resend verification OTP to user email.
    /// </summary>
    public async Task<ServiceResult<string>> ResendVerificationOtpAsync(ResendOtpDto dto)
    {
        // Find user by email
        var user = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
        if (user == null)
        {
            return ServiceResult<string>.FailureResult("User not found.");
        }

        // Check if already verified
        if (user.EmailVerifiedAt.HasValue)
        {
            return ServiceResult<string>.FailureResult("Email is already verified.");
        }

        // Generate new OTP
        var otp = GenerateOtp();
        var expiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);

        // Update user with new OTP
        await _userRepository.UpdateEmailVerificationAsync(user, otp, expiresAt);

        // Generate verification link
        var verificationLink = $"https://your-frontend-url.com/verify-email?email={Uri.EscapeDataString(user.NormalizedEmail!)}&otp={otp}";

        // Send verification email
        try
        {
            await _emailService.SendEmailVerificationAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp,
                verificationLink);
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to send verification email. Please try again later.",
                new List<string> { ex.Message });
        }

        return ServiceResult<string>.SuccessResult(
            $"Verification email sent to {user.NormalizedEmail}",
            "Please check your email and enter the 6-digit OTP to verify your account.");
    }

    /// <summary>
    /// Generate a random 6-digit OTP.
    /// </summary>
    private string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    /// <summary>
    /// Generate a secure temporary password (12 characters with letters, numbers, special chars).
    /// </summary>
    private string GenerateTemporaryPassword()
    {
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string special = "@#$%";
        const string allChars = lowercase + uppercase + digits + special;

        var random = new Random();
        var password = new char[12];
        
        // Ensure at least one of each type
        password[0] = uppercase[random.Next(uppercase.Length)];
        password[1] = lowercase[random.Next(lowercase.Length)];
        password[2] = digits[random.Next(digits.Length)];
        password[3] = special[random.Next(special.Length)];
        
        // Fill the rest randomly
        for (int i = 4; i < 12; i++)
        {
            password[i] = allChars[random.Next(allChars.Length)];
        }
        
        // Shuffle the password
        for (int i = password.Length - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }
        
        return new string(password);
    }

    /// <summary>
    /// Helper method to send verification email after user registration.
    /// Call this method after creating a user account.
    /// </summary>
    private async Task SendVerificationEmailAsync(User user)
    {
        // Generate OTP
        var otp = GenerateOtp();
        var expiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);

        // Update user with OTP
        await _userRepository.UpdateEmailVerificationAsync(user, otp, expiresAt);

        // Generate verification link
        var verificationLink = $"https://your-frontend-url.com/verify-email?email={Uri.EscapeDataString(user.NormalizedEmail!)}&otp={otp}";

        // Send verification email
        await _emailService.SendEmailVerificationAsync(
            user.NormalizedEmail!,
            user.FullName ?? "User",
            otp,
            verificationLink);
    }

    // ========================================================================
    // PASSWORD RESET (FORGOT PASSWORD)
    // ========================================================================

    /// <summary>
    /// Initiate forgot password flow - sends OTP to user email.
    /// </summary>
    public async Task<ServiceResult<string>> ForgotPasswordAsync(ForgotPasswordRequestDto dto)
    {
        try
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
            
            if (user == null)
            {
                // Return success even if user not found (security - don't reveal if email exists)
                return ServiceResult<string>.SuccessResult("If an account with that email exists, a password reset OTP has been sent.");
            }

            // Check if user is active
            if (user.IsActive != true)
            {
                return ServiceResult<string>.FailureResult("This account is not active. Please contact support.");
            }

            // Generate OTP
            var otp = GenerateOtp();
            var expiresAt = DateTime.UtcNow.AddMinutes(_emailSettings.OtpExpirationMinutes);

            // Update user with password reset OTP
            user.PasswordResetOtp = otp;
            user.PasswordResetOtpExpiresAt = expiresAt;
            await _context.SaveChangesAsync();

            // Send password reset email
            await _emailService.SendPasswordResetOtpAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User",
                otp);

            return ServiceResult<string>.SuccessResult("Password reset OTP has been sent to your email.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult($"Failed to process forgot password request: {ex.Message}");
        }
    }

    /// <summary>
    /// Verify password reset OTP.
    /// </summary>
    public async Task<ServiceResult<string>> VerifyPasswordResetOtpAsync(VerifyPasswordResetOtpDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
            
            if (user == null)
            {
                return ServiceResult<string>.FailureResult("Invalid email or OTP.");
            }

            // Check if OTP matches
            if (user.PasswordResetOtp != dto.Otp)
            {
                return ServiceResult<string>.FailureResult("Invalid OTP.");
            }

            // Check if OTP is expired
            if (user.PasswordResetOtpExpiresAt == null || user.PasswordResetOtpExpiresAt < DateTime.UtcNow)
            {
                return ServiceResult<string>.FailureResult("OTP has expired. Please request a new one.");
            }

            return ServiceResult<string>.SuccessResult("OTP verified successfully. You can now reset your password.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult($"Failed to verify OTP: {ex.Message}");
        }
    }

    /// <summary>
    /// Reset password with OTP verification.
    /// </summary>
    public async Task<ServiceResult<string>> ResetPasswordWithOtpAsync(ResetPasswordWithOtpDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email.ToUpperInvariant());
            
            if (user == null)
            {
                return ServiceResult<string>.FailureResult("Invalid email or OTP.");
            }

            // Verify OTP
            if (user.PasswordResetOtp != dto.Otp)
            {
                return ServiceResult<string>.FailureResult("Invalid OTP.");
            }

            // Check if OTP is expired
            if (user.PasswordResetOtpExpiresAt == null || user.PasswordResetOtpExpiresAt < DateTime.UtcNow)
            {
                return ServiceResult<string>.FailureResult("OTP has expired. Please request a new one.");
            }

            // Ensure security stamp exists (required for password reset)
            if (string.IsNullOrEmpty(user.SecurityStamp))
            {
                user.SecurityStamp = Guid.NewGuid().ToString();
                await _userManager.UpdateAsync(user);
            }

            // Reset password
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ServiceResult<string>.FailureResult($"Failed to reset password: {errors}");
            }

            // Clear the password reset OTP
            user.PasswordResetOtp = null;
            user.PasswordResetOtpExpiresAt = null;
            user.LastPasswordChangedAt = DateTime.UtcNow;
            user.MustChangePassword = false;
            user.IsFirstLogin = false;
            await _context.SaveChangesAsync();

            // Send confirmation email
            await _emailService.SendPasswordChangedNotificationAsync(
                user.NormalizedEmail!,
                user.FullName ?? "User");

            return ServiceResult<string>.SuccessResult("Password has been reset successfully. You can now login with your new password.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.FailureResult($"Failed to reset password: {ex.Message}");
        }
    }
}
