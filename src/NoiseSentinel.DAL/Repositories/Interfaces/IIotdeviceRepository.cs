using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Iotdevice entity operations.
/// </summary>
public interface IIotdeviceRepository
{
    /// <summary>
    /// Create a new IoT device.
    /// </summary>
    Task<int> CreateAsync(Iotdevice device);

    /// <summary>
    /// Get IoT device by ID with navigation properties.
    /// </summary>
    Task<Iotdevice?> GetByIdAsync(int deviceId);

    /// <summary>
    /// Get IoT device by device name (unique identifier).
    /// </summary>
    Task<Iotdevice?> GetByNameAsync(string deviceName);

    /// <summary>
    /// Get all IoT devices.
    /// </summary>
    Task<IEnumerable<Iotdevice>> GetAllAsync();

    /// <summary>
    /// Get calibrated and registered devices (ready for use).
    /// </summary>
    Task<IEnumerable<Iotdevice>> GetAvailableDevicesAsync();

    /// <summary>
    /// Update an existing IoT device.
    /// </summary>
    Task<bool> UpdateAsync(Iotdevice device);

    /// <summary>
    /// Update pairing timestamp when officer connects via Bluetooth.
    /// </summary>
    Task<bool> UpdatePairingDateTimeAsync(int deviceId, DateTime pairingDateTime);

    /// <summary>
    /// Check if device name already exists (case-insensitive).
    /// </summary>
    Task<bool> DeviceNameExistsAsync(string deviceName, int? excludeDeviceId = null);

    /// <summary>
    /// Check if device exists.
    /// </summary>
    Task<bool> ExistsAsync(int deviceId);

    /// <summary>
    /// Get device usage statistics (total emission reports).
    /// </summary>
    Task<int> GetDeviceUsageCountAsync(int deviceId);
}