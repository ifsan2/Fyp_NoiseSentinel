using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Role entity.
/// Handles CRUD operations for business roles (ROLE table).
/// </summary>
public class RoleRepository : IRoleRepository
{
    private readonly NoiseSentinelDbContext _context;

    public RoleRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets a role by its ID from the business ROLE table.
    /// </summary>
    /// <param name="roleId">The role ID to search for</param>
    /// <returns>The role if found, null otherwise</returns>
    public async Task<Role?> GetByIdAsync(int roleId)
    {
        return await _context.BusinessRoles.FindAsync(roleId);  // ✅ Changed from Roles
    }

    /// <summary>
    /// Gets a role by its name from the business ROLE table.
    /// </summary>
    /// <param name="roleName">The role name to search for (e.g., "Court Authority")</param>
    /// <returns>The role if found, null otherwise</returns>
    public async Task<Role?> GetByNameAsync(string roleName)
    {
        return await _context.BusinessRoles  // ✅ Changed from Roles
            .FirstOrDefaultAsync(r => r.RoleName == roleName);
    }

    /// <summary>
    /// Creates a new role in the business ROLE table.
    /// </summary>
    /// <param name="role">The role entity to create</param>
    /// <returns>The ID of the newly created role</returns>
    public async Task<int> CreateAsync(Role role)
    {
        _context.BusinessRoles.Add(role);  // ✅ Changed from Roles
        await _context.SaveChangesAsync();
        return role.RoleId;
    }
}