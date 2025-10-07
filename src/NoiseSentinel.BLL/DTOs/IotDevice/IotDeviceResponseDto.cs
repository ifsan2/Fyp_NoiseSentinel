using System;

namespace NoiseSentinel.BLL.DTOs.IotDevice;

/// <summary>
/// DTO for IoT device response with full details.
/// </summary>
public class IotDeviceResponseDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string? FirmwareVersion { get; set; }
    public bool IsCalibrated { get; set; }
    public bool IsRegistered { get; set; }
    public DateTime? PairingDateTime { get; set; }
    public int TotalEmissionReports { get; set; }
    public string Status => GetDeviceStatus();
    public string CalibrationStatus => IsCalibrated ? "Calibrated - Ready for use" : "Not Calibrated - Cannot use";
    public string RegistrationStatus => IsRegistered ? "Registered" : "Not Registered";
    public string AvailabilityStatus => (IsRegistered && IsCalibrated) ? "Available" : "Unavailable";
    public string LastPaired => PairingDateTime.HasValue
        ? $"{PairingDateTime.Value:yyyy-MM-dd HH:mm:ss} UTC"
        : "Never paired";

    private string GetDeviceStatus()
    {
        if (!IsRegistered)
            return "Not Registered";
        if (!IsCalibrated)
            return "Not Calibrated";
        return "Active";
    }
}