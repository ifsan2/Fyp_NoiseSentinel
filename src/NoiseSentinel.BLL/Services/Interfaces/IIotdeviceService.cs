using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.IotDevice;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for IoT Device management operations.
/// </summary>
public interface IIotdeviceService
{
    /// <summary>
    /// Register a new IoT device (Station Authority only).
    /// </summary>
    Task<ServiceResult<IotDeviceResponseDto>> RegisterDeviceAsync(RegisterIotDeviceDto dto, int creatorUserId);

    /// <summary>
    /// Get IoT device by ID.
    /// </summary>
    Task<ServiceResult<IotDeviceResponseDto>> GetDeviceByIdAsync(int deviceId);

    /// <summary>
    /// Get IoT device by name.
    /// </summary>
    Task<ServiceResult<IotDeviceResponseDto>> GetDeviceByNameAsync(string deviceName);

    /// <summary>
    /// Get all IoT devices.
    /// </summary>
    Task<ServiceResult<IEnumerable<IotDeviceListItemDto>>> GetAllDevicesAsync();

    /// <summary>
    /// Get available devices (calibrated and registered) for officer use.
    /// </summary>
    Task<ServiceResult<IEnumerable<IotDeviceListItemDto>>> GetAvailableDevicesAsync();

    /// <summary>
    /// Update IoT device (Station Authority only).
    /// </summary>
    Task<ServiceResult<IotDeviceResponseDto>> UpdateDeviceAsync(UpdateIotDeviceDto dto, int updaterUserId);

    /// <summary>
    /// Log device pairing (Police Officer connects via Bluetooth).
    /// </summary>
    Task<ServiceResult<string>> PairDeviceAsync(PairIotDeviceDto dto, int officerUserId);
}