using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Accused;

/// <summary>
/// DTO for creating a new accused person.
/// </summary>
public class CreateAccusedDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Full name must be between 3 and 255 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    [StringLength(20, MinimumLength = 13, ErrorMessage = "CNIC must be between 13 and 20 characters")]
    [RegularExpression(@"^[0-9]{5}-[0-9]{7}-[0-9]$", ErrorMessage = "CNIC format must be: 12345-1234567-1")]
    public string Cnic { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string? City { get; set; }

    [StringLength(100, ErrorMessage = "Province cannot exceed 100 characters")]
    public string? Province { get; set; }

    [StringLength(255, ErrorMessage = "Address cannot exceed 255 characters")]
    public string? Address { get; set; }

    [StringLength(20, MinimumLength = 10, ErrorMessage = "Contact must be between 10 and 20 characters")]
    [RegularExpression(@"^[\d\s\-\+\(\)]+$", ErrorMessage = "Invalid contact number format")]
    public string? Contact { get; set; }
}