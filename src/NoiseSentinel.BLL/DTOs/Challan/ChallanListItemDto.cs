using System;

namespace NoiseSentinel.BLL.DTOs.Challan;

/// <summary>
/// DTO for challan list item (summary view).
/// </summary>
public class ChallanListItemDto
{
    public int ChallanId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public string AccusedName { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public DateTime IssueDateTime { get; set; }
    public DateTime DueDateTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsOverdue { get; set; }
    public bool HasFir { get; set; }
}