using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("ROLE")]
[Index("RoleName", Name = "UQ__ROLE__8A2B6160E9B388B1", IsUnique = true)]
public partial class Role
{
    [Key]
    [Column("RoleID")]
    public int RoleId { get; set; }

    [StringLength(255)]
    public string? RoleName { get; set; }

    [InverseProperty("Role")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
