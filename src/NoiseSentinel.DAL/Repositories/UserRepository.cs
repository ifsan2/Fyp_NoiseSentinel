using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for User entity.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly NoiseSentinelDbContext _context;

    public UserRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserName == username);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> ExistsAsync(int userId)
    {
        return await _context.Users.AnyAsync(u => u.Id == userId);
    }

    // ========================================================================
    // EMAIL VERIFICATION METHODS
    // ========================================================================

    public async Task UpdateEmailVerificationAsync(User user, string otp, DateTime expiresAt)
    {
        user.EmailVerificationOtp = otp;
        user.OtpExpiresAt = expiresAt;
        await _context.SaveChangesAsync();
    }

    public async Task<User?> GetByOtpAsync(string otp)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.EmailVerificationOtp == otp && u.OtpExpiresAt > DateTime.UtcNow);
    }

    public async Task MarkEmailAsVerifiedAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.EmailVerifiedAt = DateTime.UtcNow;
            user.EmailVerificationOtp = null;
            user.OtpExpiresAt = null;
            user.IsActive = true; // ✅ Activate user after email verification
            await _context.SaveChangesAsync();
        }
    }
}