using System;
using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.IotDevice;

/// <summary>
/// DTO for registering a new IoT device.
/// </summary>
public class RegisterIotDeviceDto
{
    [Required(ErrorMessage = "Device name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Device name must be between 3 and 255 characters")]
    [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "Device name can only contain uppercase letters, numbers, and hyphens (e.g., IOT-TSB-1, IOT-RWP-002)")]
    public string DeviceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Firmware version is required")]
    [StringLength(100, ErrorMessage = "Firmware version cannot exceed 100 characters")]
    [RegularExpression(@"^v?\d+\.\d+(\.\d+)?$", ErrorMessage = "Invalid firmware version format (e.g., v1.0, v1.1, 1.2.3)")]
    public string FirmwareVersion { get; set; } = string.Empty;

    [Required(ErrorMessage = "Calibration date is required")]
    public DateTime CalibrationDate { get; set; }

    [Required(ErrorMessage = "Calibration status is required")]
    public bool CalibrationStatus { get; set; }

    [StringLength(255, ErrorMessage = "Certificate number cannot exceed 255 characters")]
    public string? CalibrationCertificateNo { get; set; }
}