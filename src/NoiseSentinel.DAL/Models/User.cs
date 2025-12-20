using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace NoiseSentinel.DAL.Models;

[Table("USER")]
public partial class User : IdentityUser<int>
{
    [Column("UserID")]
    public override int Id { get; set; }

    [StringLength(255)]
    public string? FullName { get; set; }

    [Column("Email")]
    [StringLength(255)]
    public override string? NormalizedEmail { get; set; }

    [Column("Username")]
    [StringLength(255)]
    public override string? NormalizedUserName { get; set; }

    [Column("PasswordHash")]
    [StringLength(255)]
    public override string? PasswordHash { get; set; }

    [Column("IsActive")]
    public bool? IsActive { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("RoleID")]
    public int? RoleId { get; set; }

    // Email Verification Fields
    [StringLength(6)]
    public string? EmailVerificationOtp { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? OtpExpiresAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EmailVerifiedAt { get; set; }

    // First Login and Password Management
    public bool IsFirstLogin { get; set; } = true;

    [Column(TypeName = "datetime")]
    public DateTime? LastPasswordChangedAt { get; set; }

    public bool MustChangePassword { get; set; } = false;

    [InverseProperty("User")]
    public virtual ICollection<Judge> Judges { get; set; } = new List<Judge>();

    [InverseProperty("User")]
    public virtual ICollection<Policeofficer> Policeofficers { get; set; } = new List<Policeofficer>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role? Role { get; set; }

    // ✅ Add computed properties for Email and UserName
    [NotMapped]
    public override string? Email
    {
        get => NormalizedEmail;
        set => NormalizedEmail = value?.ToUpperInvariant();
    }

    [NotMapped]
    public override string? UserName
    {
        get => NormalizedUserName;
        set => NormalizedUserName = value?.ToUpperInvariant();
    }
}