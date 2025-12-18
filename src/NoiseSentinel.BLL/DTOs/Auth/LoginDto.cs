using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Auth;

/// <summary>
/// DTO for user login.
/// Accepts either username or email for authentication.
/// </summary>
public class LoginDto
{
    [Required(ErrorMessage = "Username or Email is required")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}