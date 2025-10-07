using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Accused;

/// <summary>
/// DTO for accused input during challan creation (auto-create if not exists).
/// </summary>
public class AccusedInputDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Full name must be between 3 and 255 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    [StringLength(20, MinimumLength = 13, ErrorMessage = "CNIC must be between 13 and 20 characters")]
    [RegularExpression(@"^[0-9]{5}-[0-9]{7}-[0-9]$", ErrorMessage = "CNIC format must be: 12345-1234567-1")]
    public string Cnic { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required")]
    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Province is required")]
    [StringLength(100, ErrorMessage = "Province cannot exceed 100 characters")]
    public string Province { get; set; } = string.Empty;

    [Required(ErrorMessage = "Address is required")]
    [StringLength(255, ErrorMessage = "Address cannot exceed 255 characters")]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Contact is required")]
    [StringLength(20, MinimumLength = 10, ErrorMessage = "Contact must be between 10 and 20 characters")]
    [RegularExpression(@"^[\d\s\-\+\(\)]+$", ErrorMessage = "Invalid contact number format")]
    public string Contact { get; set; } = string.Empty;
}