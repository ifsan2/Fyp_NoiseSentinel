namespace NoiseSentinel.BLL.DTOs.Auth;

/// <summary>
/// DTO for user creation response.
/// </summary>
public class UserCreatedResponseDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}