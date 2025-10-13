namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for user list item (table display).
/// </summary>
public class UserListItemDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status => IsActive ? "Active" : "Inactive";
}