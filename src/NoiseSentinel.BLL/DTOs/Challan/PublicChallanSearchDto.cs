using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Challan;

/// <summary>
/// DTO for public challan search by vehicle number and CNIC.
/// </summary>
public class PublicChallanSearchDto
{
    [Required(ErrorMessage = "Vehicle plate number is required")]
    [StringLength(50, ErrorMessage = "Vehicle plate number cannot exceed 50 characters")]
    public string PlateNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "CNIC is required")]
    [StringLength(15, ErrorMessage = "CNIC cannot exceed 15 characters")]
    [RegularExpression(@"^\d{5}-\d{7}-\d{1}$", ErrorMessage = "CNIC must be in format: 12345-1234567-1")]
    public string Cnic { get; set; } = string.Empty;
}
