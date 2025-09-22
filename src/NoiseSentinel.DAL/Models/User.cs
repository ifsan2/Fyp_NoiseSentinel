using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("USER")]
[Index("Username", Name = "UQ__USER__536C85E42AE6128F", IsUnique = true)]
[Index("Email", Name = "UQ__USER__A9D10534E693CC7D", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    [StringLength(255)]
    public string? FullName { get; set; }

    [StringLength(255)]
    public string? Email { get; set; }

    [StringLength(255)]
    public string? Username { get; set; }

    [StringLength(255)]
    public string? PasswordHash { get; set; }

    public bool? IsActive { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("RoleID")]
    public int? RoleId { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Judge> Judges { get; set; } = new List<Judge>();

    [InverseProperty("User")]
    public virtual ICollection<Policeofficer> Policeofficers { get; set; } = new List<Policeofficer>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role? Role { get; set; }
}
