using System;
using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Auth;

/// <summary>
/// DTO for creating a Police Officer account by Station Authority.
/// </summary>
public class CreatePoliceOfficerDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Username is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 255 characters")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    [StringLength(20, ErrorMessage = "CNIC cannot exceed 20 characters")]
    public string Cnic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Contact number is required")]
    [StringLength(20, ErrorMessage = "Contact number cannot exceed 20 characters")]
    public string ContactNo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Badge number is required")]
    [StringLength(50, ErrorMessage = "Badge number cannot exceed 50 characters")]
    public string BadgeNumber { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Rank cannot exceed 100 characters")]
    public string? Rank { get; set; }

    public bool IsInvestigationOfficer { get; set; } = false;

    public int? StationId { get; set; }

    public DateTime? PostingDate { get; set; }
}