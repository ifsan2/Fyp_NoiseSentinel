using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace NoiseSentinel.DAL.Models;

/// <summary>
/// Custom IdentityRole mapped to AspNetRoles table.
/// Uses integer primary keys to match our existing schema.
/// </summary>
[Table("AspNetRoles")]
public class ApplicationRole : IdentityRole<int>
{
    /// <summary>
    /// Parameterless constructor required by EF Core.
    /// </summary>
    public ApplicationRole() : base()
    {
    }

    /// <summary>
    /// Constructor with role name for easier initialization.
    /// </summary>
    public ApplicationRole(string roleName) : base(roleName)
    {
        NormalizedName = roleName.ToUpperInvariant();
    }
}