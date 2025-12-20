using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Public;

/// <summary>
/// DTO for requesting OTP for public status check.
/// </summary>
public class RequestStatusOtpDto
{
    [Required(ErrorMessage = "Vehicle number is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Vehicle number must be between 2 and 50 characters")]
    public string VehicleNo { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    [StringLength(20, MinimumLength = 13, ErrorMessage = "CNIC must be between 13 and 20 characters")]
    [RegularExpression(@"^[0-9]{5}-[0-9]{7}-[0-9]$", ErrorMessage = "CNIC format must be: 12345-1234567-1")]
    public string Cnic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// DTO for verifying OTP for public status check.
/// </summary>
public class VerifyStatusOtpDto
{
    [Required(ErrorMessage = "Vehicle number is required")]
    public string VehicleNo { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    public string Cnic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "OTP is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 digits")]
    public string Otp { get; set; } = string.Empty;
}

/// <summary>
/// Response after OTP verification with access token.
/// </summary>
public class StatusOtpVerificationResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// Complete case status response for public viewing.
/// </summary>
public class PublicCaseStatusResponseDto
{
    // Accused Information
    public string AccusedName { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string? Contact { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }

    // Vehicle Information
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleColor { get; set; }
    public DateTime? VehicleRegYear { get; set; }

    // Summary Statistics
    public int TotalChallans { get; set; }
    public int UnpaidChallans { get; set; }
    public int TotalFirs { get; set; }
    public int ActiveCases { get; set; }
    public decimal TotalPenaltyAmount { get; set; }
    public decimal UnpaidPenaltyAmount { get; set; }

    // Detailed Records
    public List<PublicChallanDto> Challans { get; set; } = new();
    public List<PublicFirDto> Firs { get; set; } = new();
    public List<PublicCaseDto> Cases { get; set; } = new();
}

/// <summary>
/// Challan information for public view.
/// </summary>
public class PublicChallanDto
{
    public int ChallanId { get; set; }
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime IssueDateTime { get; set; }
    public DateTime DueDateTime { get; set; }
    public string StationName { get; set; } = string.Empty;
    public bool IsCognizable { get; set; }
    public bool HasFir { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// FIR information for public view.
/// </summary>
public class PublicFirDto
{
    public int FirId { get; set; }
    public string FirNo { get; set; } = string.Empty;
    public DateTime DateFiled { get; set; }
    public string Status { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public int RelatedChallanId { get; set; }
    public bool HasCase { get; set; }
}

/// <summary>
/// Case information for public view.
/// </summary>
public class PublicCaseDto
{
    public int CaseId { get; set; }
    public string CaseNo { get; set; } = string.Empty;
    public string CaseType { get; set; } = string.Empty;
    public string CaseStatus { get; set; } = string.Empty;
    public DateTime? HearingDate { get; set; }
    public string? Verdict { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public string JudgeName { get; set; } = string.Empty;
    public string FirNo { get; set; } = string.Empty;
    public List<PublicCaseStatementDto> Statements { get; set; } = new();
}

/// <summary>
/// Case statement information for public view.
/// </summary>
public class PublicCaseStatementDto
{
    public int StatementId { get; set; }
    public string StatementBy { get; set; } = string.Empty;
    public string StatementText { get; set; } = string.Empty;
    public DateTime StatementDate { get; set; }
}
