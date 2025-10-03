using NoiseSentinel.DAL.Models;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for User entity operations.
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsAsync(int userId);
}