namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for Judge with full court information.
/// </summary>
public class JudgeDetailsDto
{
    public int JudgeId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string ContactNo { get; set; } = string.Empty;
    public string Rank { get; set; } = string.Empty;
    public bool ServiceStatus { get; set; }
    public bool IsActive { get; set; }
    
    // Court Information
    public int CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public string CourtLocation { get; set; } = string.Empty;
    public string CourtType { get; set; } = string.Empty;
    
    // Statistics
    public int TotalCases { get; set; }
    
    public string Status => IsActive ? "Active" : "Inactive";
}