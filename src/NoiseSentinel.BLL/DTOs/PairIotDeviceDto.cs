using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.IotDevice;

/// <summary>
/// DTO for logging IoT device pairing (Bluetooth connection).
/// </summary>
public class PairIotDeviceDto
{
    [Required(ErrorMessage = "Device ID is required")]
    public int DeviceId { get; set; }
}