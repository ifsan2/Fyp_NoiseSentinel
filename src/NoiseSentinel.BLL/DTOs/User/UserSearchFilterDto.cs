namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for user search and filtering parameters.
/// </summary>
public class UserSearchFilterDto
{
    public string? SearchQuery { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}