using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Auth;

/// <summary>
/// DTO for admin creating a Station Authority account.
/// </summary>
public class CreateStationAuthorityDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Full name must be between 3 and 255 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Username is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 255 characters")]
    [RegularExpression(@"^[a-zA-Z0-9_-]+$", ErrorMessage = "Username can only contain letters, numbers, underscores, and hyphens")]
    public string Username { get; set; } = string.Empty;
}