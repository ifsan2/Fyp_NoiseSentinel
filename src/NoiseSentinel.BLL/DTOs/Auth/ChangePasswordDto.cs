using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Auth;

/// <summary>
/// DTO for changing user password.
/// </summary>
public class ChangePasswordDto
{
    /// <summary>
    /// Current password - Optional for forced password changes (MustChangePassword = true).
    /// Required for normal password changes.
    /// </summary>
    public string? CurrentPassword { get; set; }

    [Required(ErrorMessage = "New password is required")]
    [StringLength(255, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("NewPassword", ErrorMessage = "New password and confirm password do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>
    /// Indicates this is a forced password change (after OTP verification).
    /// When true, CurrentPassword is not required.
    /// </summary>
    public bool IsForcedChange { get; set; } = false;
}