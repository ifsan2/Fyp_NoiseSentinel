using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Auth;

/// <summary>
/// DTO for OTP verification.
/// </summary>
public class VerifyOtpDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "OTP is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be a 6-digit number")]
    public string Otp { get; set; } = string.Empty;
}
