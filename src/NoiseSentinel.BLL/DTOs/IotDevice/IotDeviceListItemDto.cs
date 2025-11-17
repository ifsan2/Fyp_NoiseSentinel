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
    public DateTime? CalibrationDate { get; set; }
    public bool CalibrationStatus { get; set; }
    public string? CalibrationCertificateNo { get; set; }
    public bool IsActive { get; set; }
    public bool IsPaired { get; set; }
    public int? PairedOfficerId { get; set; }
    public string? PairedOfficerName { get; set; }
    public DateTime? PairingDateTime { get; set; }
    public int TotalEmissionReports { get; set; }
}