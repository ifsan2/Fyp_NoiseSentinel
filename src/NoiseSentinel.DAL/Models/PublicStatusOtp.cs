using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NoiseSentinel.DAL.Models;

/// <summary>
/// Model for storing OTPs for public status check feature.
/// Allows accused persons to verify their identity and view case status.
/// </summary>
[Table("PUBLIC_STATUS_OTP")]
public class PublicStatusOtp
{
    [Key]
    [Column("OtpId")]
    public int OtpId { get; set; }

    /// <summary>
    /// Vehicle plate number for identification
    /// </summary>
    [Required]
    [StringLength(50)]
    public string VehicleNo { get; set; } = string.Empty;

    /// <summary>
    /// CNIC of the accused person
    /// </summary>
    [Required]
    [Column("CNIC")]
    [StringLength(20)]
    public string Cnic { get; set; } = string.Empty;

    /// <summary>
    /// Email where OTP was sent
    /// </summary>
    [Required]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// The 6-digit OTP code
    /// </summary>
    [Required]
    [StringLength(10)]
    public string OtpCode { get; set; } = string.Empty;

    /// <summary>
    /// When the OTP was created
    /// </summary>
    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the OTP expires
    /// </summary>
    [Column(TypeName = "datetime")]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Whether the OTP has been verified
    /// </summary>
    public bool IsVerified { get; set; } = false;

    /// <summary>
    /// Access token generated after OTP verification (for downloading/viewing)
    /// </summary>
    [StringLength(500)]
    public string? AccessToken { get; set; }

    /// <summary>
    /// When the access token expires
    /// </summary>
    [Column(TypeName = "datetime")]
    public DateTime? AccessTokenExpiresAt { get; set; }
}
