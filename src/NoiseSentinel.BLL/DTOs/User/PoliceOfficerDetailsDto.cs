namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for Police Officer with full station information.
/// </summary>
public class PoliceOfficerDetailsDto
{
    public int OfficerId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string ContactNo { get; set; } = string.Empty;
    public string BadgeNumber { get; set; } = string.Empty;
    public string Rank { get; set; } = string.Empty;
    public bool IsInvestigationOfficer { get; set; }
    public DateTime PostingDate { get; set; }
    public bool IsActive { get; set; }
    
    // Station Information
    public int StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string StationLocation { get; set; } = string.Empty;
    public string StationCode { get; set; } = string.Empty;
    
    // Statistics
    public int TotalChallans { get; set; }
    
    public string Status => IsActive ? "Active" : "Inactive";
    public string InvestigationOfficerBadge => IsInvestigationOfficer ? "Yes" : "No";
}