using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.IotDevice;

/// <summary>
/// DTO for completing device calibration.
/// </summary>
public class CompleteCalibrationDto
{
    [Required(ErrorMessage = "Device ID is required")]
    public int DeviceId { get; set; }

    [Required(ErrorMessage = "Sound calibration offset is required")]
    public float SoundCalibrationOffset { get; set; }

    [Required(ErrorMessage = "CO calibration offset is required")]
    public float CoCalibrationOffset { get; set; }

    [Required(ErrorMessage = "HC calibration offset is required")]
    public float HcCalibrationOffset { get; set; }

    [Required(ErrorMessage = "Calibration status is required")]
    public bool IsSuccessful { get; set; }

    [Required(ErrorMessage = "Calibration date is required")]
    public DateTime CalibrationDate { get; set; }

    [StringLength(255, ErrorMessage = "Certificate number cannot exceed 255 characters")]
    public string? CalibrationCertificateNo { get; set; }

    public string? Notes { get; set; }
}
