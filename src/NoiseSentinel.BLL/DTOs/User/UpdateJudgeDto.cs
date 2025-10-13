using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.User;

/// <summary>
/// DTO for updating Judge details (CNIC, Contact, Rank only - NOT court assignment).
/// Court assignment remains with Court Authority.
/// </summary>
public class UpdateJudgeDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Full name must be between 3 and 255 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    [StringLength(50, ErrorMessage = "CNIC cannot exceed 50 characters")]
    public string Cnic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Contact number is required")]
    [StringLength(50, ErrorMessage = "Contact number cannot exceed 50 characters")]
    public string ContactNo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Rank is required")]
    [StringLength(100, ErrorMessage = "Rank cannot exceed 100 characters")]
    public string Rank { get; set; } = string.Empty;
}