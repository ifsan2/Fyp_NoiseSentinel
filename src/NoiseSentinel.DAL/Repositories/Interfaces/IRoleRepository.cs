using NoiseSentinel.DAL.Models;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Role entity operations.
/// </summary>
public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(int roleId);
    Task<Role?> GetByNameAsync(string roleName);
    Task<int> CreateAsync(Role role);
}