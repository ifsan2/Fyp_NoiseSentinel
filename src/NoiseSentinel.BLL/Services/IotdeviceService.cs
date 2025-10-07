using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.IotDevice;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for IoT Device management operations.
/// </summary>
public class IotdeviceService : IIotdeviceService
{
    private readonly IIotdeviceRepository _iotdeviceRepository;
    private readonly NoiseSentinelDbContext _context;

    public IotdeviceService(
        IIotdeviceRepository iotdeviceRepository,
        NoiseSentinelDbContext context)
    {
        _iotdeviceRepository = iotdeviceRepository;
        _context = context;
    }

    public async Task<ServiceResult<IotDeviceResponseDto>> RegisterDeviceAsync(
        RegisterIotDeviceDto dto, int creatorUserId)
    {
        // Verify creator is Station Authority
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                "Only Station Authority users can register IoT devices.");
        }

        // Check if device name already exists
        var nameExists = await _iotdeviceRepository.DeviceNameExistsAsync(dto.DeviceName);
        if (nameExists)
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                $"IoT Device with name '{dto.DeviceName}' already exists in the system.");
        }

        // Create IoT device
        var device = new Iotdevice
        {
            DeviceName = dto.DeviceName,
            FirmwareVersion = dto.FirmwareVersion,
            IsCalibrated = dto.IsCalibrated,
            IsRegistered = true,  // Always true on registration
            PairingDateTime = null  // Not paired yet
        };

        var deviceId = await _iotdeviceRepository.CreateAsync(device);

        // Retrieve created device
        var createdDevice = await _iotdeviceRepository.GetByIdAsync(deviceId);

        var response = new IotDeviceResponseDto
        {
            DeviceId = createdDevice!.DeviceId,
            DeviceName = createdDevice.DeviceName ?? string.Empty,
            FirmwareVersion = createdDevice.FirmwareVersion,
            IsCalibrated = createdDevice.IsCalibrated ?? false,
            IsRegistered = createdDevice.IsRegistered ?? false,
            PairingDateTime = createdDevice.PairingDateTime,
            TotalEmissionReports = createdDevice.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(
            response,
            $"IoT Device '{dto.DeviceName}' registered successfully.");
    }

    public async Task<ServiceResult<IotDeviceResponseDto>> GetDeviceByIdAsync(int deviceId)
    {
        var device = await _iotdeviceRepository.GetByIdAsync(deviceId);

        if (device == null)
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                $"IoT Device with ID {deviceId} not found.");
        }

        var response = new IotDeviceResponseDto
        {
            DeviceId = device.DeviceId,
            DeviceName = device.DeviceName ?? string.Empty,
            FirmwareVersion = device.FirmwareVersion,
            IsCalibrated = device.IsCalibrated ?? false,
            IsRegistered = device.IsRegistered ?? false,
            PairingDateTime = device.PairingDateTime,
            TotalEmissionReports = device.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IotDeviceResponseDto>> GetDeviceByNameAsync(string deviceName)
    {
        var device = await _iotdeviceRepository.GetByNameAsync(deviceName);

        if (device == null)
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                $"IoT Device with name '{deviceName}' not found.");
        }

        var response = new IotDeviceResponseDto
        {
            DeviceId = device.DeviceId,
            DeviceName = device.DeviceName ?? string.Empty,
            FirmwareVersion = device.FirmwareVersion,
            IsCalibrated = device.IsCalibrated ?? false,
            IsRegistered = device.IsRegistered ?? false,
            PairingDateTime = device.PairingDateTime,
            TotalEmissionReports = device.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<IotDeviceListItemDto>>> GetAllDevicesAsync()
    {
        var devices = await _iotdeviceRepository.GetAllAsync();

        var response = devices.Select(d => new IotDeviceListItemDto
        {
            DeviceId = d.DeviceId,
            DeviceName = d.DeviceName ?? string.Empty,
            FirmwareVersion = d.FirmwareVersion,
            IsCalibrated = d.IsCalibrated ?? false,
            IsRegistered = d.IsRegistered ?? false,
            PairingDateTime = d.PairingDateTime,
            TotalEmissionReports = d.Emissionreports?.Count ?? 0,
            Status = GetDeviceStatus(d.IsRegistered, d.IsCalibrated),
            IsAvailable = (d.IsRegistered ?? false) && (d.IsCalibrated ?? false)
        }).ToList();

        return ServiceResult<IEnumerable<IotDeviceListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<IotDeviceListItemDto>>> GetAvailableDevicesAsync()
    {
        var devices = await _iotdeviceRepository.GetAvailableDevicesAsync();

        var response = devices.Select(d => new IotDeviceListItemDto
        {
            DeviceId = d.DeviceId,
            DeviceName = d.DeviceName ?? string.Empty,
            FirmwareVersion = d.FirmwareVersion,
            IsCalibrated = d.IsCalibrated ?? false,
            IsRegistered = d.IsRegistered ?? false,
            PairingDateTime = d.PairingDateTime,
            TotalEmissionReports = d.Emissionreports?.Count ?? 0,
            Status = "Active",
            IsAvailable = true
        }).ToList();

        return ServiceResult<IEnumerable<IotDeviceListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IotDeviceResponseDto>> UpdateDeviceAsync(
        UpdateIotDeviceDto dto, int updaterUserId)
    {
        // Verify updater is Station Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                "Only Station Authority users can update IoT devices.");
        }

        // Check if device exists
        var existingDevice = await _iotdeviceRepository.GetByIdAsync(dto.DeviceId);
        if (existingDevice == null)
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                $"IoT Device with ID {dto.DeviceId} not found.");
        }

        // Check if new device name already exists (excluding current device)
        var nameExists = await _iotdeviceRepository
            .DeviceNameExistsAsync(dto.DeviceName, dto.DeviceId);

        if (nameExists)
        {
            return ServiceResult<IotDeviceResponseDto>.FailureResult(
                $"IoT Device with name '{dto.DeviceName}' already exists.");
        }

        // Update device
        existingDevice.DeviceName = dto.DeviceName;
        existingDevice.FirmwareVersion = dto.FirmwareVersion;
        existingDevice.IsCalibrated = dto.IsCalibrated;
        existingDevice.IsRegistered = dto.IsRegistered;

        await _iotdeviceRepository.UpdateAsync(existingDevice);

        // Retrieve updated device
        var updatedDevice = await _iotdeviceRepository.GetByIdAsync(dto.DeviceId);

        var response = new IotDeviceResponseDto
        {
            DeviceId = updatedDevice!.DeviceId,
            DeviceName = updatedDevice.DeviceName ?? string.Empty,
            FirmwareVersion = updatedDevice.FirmwareVersion,
            IsCalibrated = updatedDevice.IsCalibrated ?? false,
            IsRegistered = updatedDevice.IsRegistered ?? false,
            PairingDateTime = updatedDevice.PairingDateTime,
            TotalEmissionReports = updatedDevice.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(
            response,
            $"IoT Device '{dto.DeviceName}' updated successfully.");
    }

    public async Task<ServiceResult<string>> PairDeviceAsync(PairIotDeviceDto dto, int officerUserId)
    {
        // Verify user is Police Officer
        var officer = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == officerUserId);

        if (officer?.Role?.RoleName != "Police Officer")
        {
            return ServiceResult<string>.FailureResult(
                "Only Police Officers can pair with IoT devices.");
        }

        // Check if device exists
        var device = await _iotdeviceRepository.GetByIdAsync(dto.DeviceId);
        if (device == null)
        {
            return ServiceResult<string>.FailureResult(
                $"IoT Device with ID {dto.DeviceId} not found.");
        }

        // Validate device is available for use
        if (device.IsRegistered != true)
        {
            return ServiceResult<string>.FailureResult(
                $"Device '{device.DeviceName}' is not registered. Cannot pair.");
        }

        if (device.IsCalibrated != true)
        {
            return ServiceResult<string>.FailureResult(
                $"Device '{device.DeviceName}' is not calibrated. Cannot use for readings.");
        }

        // Update pairing timestamp
        var pairingTime = DateTime.UtcNow;
        await _iotdeviceRepository.UpdatePairingDateTimeAsync(dto.DeviceId, pairingTime);

        return ServiceResult<string>.SuccessResult(
            $"Successfully paired with device '{device.DeviceName}' at {pairingTime:yyyy-MM-dd HH:mm:ss} UTC. " +
            $"Device is ready for emission readings.");
    }

    private string GetDeviceStatus(bool? isRegistered, bool? isCalibrated)
    {
        if (isRegistered != true)
            return "Not Registered";
        if (isCalibrated != true)
            return "Not Calibrated";
        return "Active";
    }
}