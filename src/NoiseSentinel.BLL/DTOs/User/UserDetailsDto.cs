namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for detailed user information.
/// </summary>
public class UserDetailsDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Additional info for specific roles
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
    
    // For Judge
    public int? JudgeId { get; set; }
    public string? Cnic { get; set; }
    public string? ContactNo { get; set; }
    public string? Rank { get; set; }
    public int? CourtId { get; set; }
    public string? CourtName { get; set; }
    public string? CourtLocation { get; set; }
    public string? CourtType { get; set; }
    
    // For Police Officer
    public int? OfficerId { get; set; }
    public string? BadgeNumber { get; set; }
    public bool? IsInvestigationOfficer { get; set; }
    public int? StationId { get; set; }
    public string? StationName { get; set; }
    public string? StationLocation { get; set; }
    public string? StationCode { get; set; }
    public DateTime? PostingDate { get; set; }
}