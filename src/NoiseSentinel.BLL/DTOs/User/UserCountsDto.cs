namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for user statistics/counts.
/// </summary>
public class UserCountsDto
{
    public int TotalUsers { get; set; }
    public int TotalAdmins { get; set; }
    public int TotalCourtAuthorities { get; set; }
    public int TotalStationAuthorities { get; set; }
    public int TotalJudges { get; set; }
    public int TotalPoliceOfficers { get; set; }
    
    public int ActiveUsers { get; set; }
    public int InactiveUsers { get; set; }
}