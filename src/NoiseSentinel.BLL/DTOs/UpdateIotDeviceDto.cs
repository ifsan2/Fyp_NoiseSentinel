using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.IotDevice;

/// <summary>
/// DTO for updating an existing IoT device.
/// </summary>
public class UpdateIotDeviceDto
{
    [Required(ErrorMessage = "Device ID is required")]
    public int DeviceId { get; set; }

    [Required(ErrorMessage = "Device name is required")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "Device name must be between 3 and 255 characters")]
    [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "Device name can only contain uppercase letters, numbers, and hyphens")]
    public string DeviceName { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Firmware version cannot exceed 100 characters")]
    [RegularExpression(@"^v?\d+\.\d+(\.\d+)?$", ErrorMessage = "Invalid firmware version format (e.g., v1.2.3)")]
    public string? FirmwareVersion { get; set; }

    [Required(ErrorMessage = "Calibration status is required")]
    public bool IsCalibrated { get; set; }

    [Required(ErrorMessage = "Registration status is required")]
    public bool IsRegistered { get; set; }
}