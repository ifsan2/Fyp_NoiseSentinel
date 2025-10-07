using System;

namespace NoiseSentinel.BLL.DTOs.IotDevice;

/// <summary>
/// DTO for IoT device list item (summary view).
/// </summary>
public class IotDeviceListItemDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string? FirmwareVersion { get; set; }
    public bool IsCalibrated { get; set; }
    public bool IsRegistered { get; set; }
    public DateTime? PairingDateTime { get; set; }
    public int TotalEmissionReports { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}