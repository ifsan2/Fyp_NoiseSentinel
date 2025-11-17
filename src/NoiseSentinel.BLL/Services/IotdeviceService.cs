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
            CalibrationDate = dto.CalibrationDate,
            CalibrationStatus = dto.CalibrationStatus,
            CalibrationCertificateNo = dto.CalibrationCertificateNo,
            IsActive = true,  // Active by default
            PairingDateTime = null,  // Not paired yet
            PairedOfficerId = null
        };

        var deviceId = await _iotdeviceRepository.CreateAsync(device);

        // Retrieve created device
        var createdDevice = await _iotdeviceRepository.GetByIdAsync(deviceId);

        var response = new IotDeviceResponseDto
        {
            DeviceId = createdDevice!.DeviceId,
            DeviceName = createdDevice.DeviceName ?? string.Empty,
            FirmwareVersion = createdDevice.FirmwareVersion,
            CalibrationDate = createdDevice.CalibrationDate,
            CalibrationStatus = createdDevice.CalibrationStatus ?? false,
            CalibrationCertificateNo = createdDevice.CalibrationCertificateNo,
            IsActive = createdDevice.IsActive ?? true,
            IsPaired = false,
            PairedOfficerId = null,
            PairedOfficerName = null,
            PairingDateTime = null,
            TotalEmissionReports = createdDevice.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(
            response,
            $"IoT Device '{dto.DeviceName}' registered successfully.");
    }

    public async Task<ServiceResult<IotDeviceResponseDto>> GetDeviceByIdAsync(int deviceId)
    {
        var device = await _context.Iotdevices
            .Include(d => d.PairedOfficer)
                .ThenInclude(o => o!.User)
            .FirstOrDefaultAsync(d => d.DeviceId == deviceId);

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
            CalibrationDate = device.CalibrationDate,
            CalibrationStatus = device.CalibrationStatus ?? false,
            CalibrationCertificateNo = device.CalibrationCertificateNo,
            IsActive = device.IsActive ?? true,
            IsPaired = device.PairedOfficerId.HasValue,
            PairedOfficerId = device.PairedOfficerId,
            PairedOfficerName = device.PairedOfficer?.User?.FullName,
            PairingDateTime = device.PairingDateTime,
            TotalEmissionReports = device.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IotDeviceResponseDto>> GetDeviceByNameAsync(string deviceName)
    {
        var device = await _context.Iotdevices
            .Include(d => d.PairedOfficer)
                .ThenInclude(o => o!.User)
            .FirstOrDefaultAsync(d => d.DeviceName == deviceName);

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
            CalibrationDate = device.CalibrationDate,
            CalibrationStatus = device.CalibrationStatus ?? false,
            CalibrationCertificateNo = device.CalibrationCertificateNo,
            IsActive = device.IsActive ?? true,
            IsPaired = device.PairedOfficerId.HasValue,
            PairedOfficerId = device.PairedOfficerId,
            PairedOfficerName = device.PairedOfficer?.User?.FullName,
            PairingDateTime = device.PairingDateTime,
            TotalEmissionReports = device.Emissionreports?.Count ?? 0
        };

        return ServiceResult<IotDeviceResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<IotDeviceListItemDto>>> GetAllDevicesAsync()
    {
        var devices = await _context.Iotdevices
            .Include(d => d.PairedOfficer)
                .ThenInclude(o => o!.User)
            .ToListAsync();

        var response = devices.Select(d => new IotDeviceListItemDto
        {
            DeviceId = d.DeviceId,
            DeviceName = d.DeviceName ?? string.Empty,
            FirmwareVersion = d.FirmwareVersion,
            CalibrationDate = d.CalibrationDate,
            CalibrationStatus = d.CalibrationStatus ?? false,
            CalibrationCertificateNo = d.CalibrationCertificateNo,
            IsActive = d.IsActive ?? true,
            IsPaired = d.PairedOfficerId.HasValue,
            PairedOfficerId = d.PairedOfficerId,
            PairedOfficerName = d.PairedOfficer?.User?.FullName,
            PairingDateTime = d.PairingDateTime,
            TotalEmissionReports = d.Emissionreports?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<IotDeviceListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<IotDeviceListItemDto>>> GetAvailableDevicesAsync()
    {
        var devices = await _context.Iotdevices
            .Where(d => d.IsActive == true && 
                       d.CalibrationStatus == true && 
                       d.PairedOfficerId == null)
            .ToListAsync();

        var response = devices.Select(d => new IotDeviceListItemDto
        {
            DeviceId = d.DeviceId,
            DeviceName = d.DeviceName ?? string.Empty,
            FirmwareVersion = d.FirmwareVersion,
            CalibrationDate = d.CalibrationDate,
            CalibrationStatus = d.CalibrationStatus ?? false,
            CalibrationCertificateNo = d.CalibrationCertificateNo,
            IsActive = d.IsActive ?? true,
            IsPaired = false,
            PairedOfficerId = null,
            PairedOfficerName = null,
            PairingDateTime = null,
            TotalEmissionReports = d.Emissionreports?.Count ?? 0
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
        existingDevice.CalibrationDate = dto.CalibrationDate;
        existingDevice.CalibrationStatus = dto.CalibrationStatus;
        existingDevice.CalibrationCertificateNo = dto.CalibrationCertificateNo;

        await _iotdeviceRepository.UpdateAsync(existingDevice);

        // Retrieve updated device
        var updatedDevice = await _context.Iotdevices
            .Include(d => d.PairedOfficer)
                .ThenInclude(o => o!.User)
            .FirstOrDefaultAsync(d => d.DeviceId == dto.DeviceId);

        var response = new IotDeviceResponseDto
        {
            DeviceId = updatedDevice!.DeviceId,
            DeviceName = updatedDevice.DeviceName ?? string.Empty,
            FirmwareVersion = updatedDevice.FirmwareVersion,
            CalibrationDate = updatedDevice.CalibrationDate,
            CalibrationStatus = updatedDevice.CalibrationStatus ?? false,
            CalibrationCertificateNo = updatedDevice.CalibrationCertificateNo,
            IsActive = updatedDevice.IsActive ?? true,
            IsPaired = updatedDevice.PairedOfficerId.HasValue,
            PairedOfficerId = updatedDevice.PairedOfficerId,
            PairedOfficerName = updatedDevice.PairedOfficer?.User?.FullName,
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
            .Include(u => u.Policeofficers)
            .FirstOrDefaultAsync(u => u.Id == officerUserId);

        if (officer?.Role?.RoleName != "Police Officer")
        {
            return ServiceResult<string>.FailureResult(
                "Only Police Officers can pair with IoT devices.");
        }

        var policeofficer = officer.Policeofficers.FirstOrDefault();
        if (policeofficer == null)
        {
            return ServiceResult<string>.FailureResult("Police Officer profile not found.");
        }

        // Check if device exists
        var device = await _iotdeviceRepository.GetByIdAsync(dto.DeviceId);
        if (device == null)
        {
            return ServiceResult<string>.FailureResult(
                $"IoT Device with ID {dto.DeviceId} not found.");
        }

        // Validate device is available for use
        if (device.IsActive != true)
        {
            return ServiceResult<string>.FailureResult(
                $"Device '{device.DeviceName}' is not active. Cannot pair.");
        }

        if (device.CalibrationStatus != true)
        {
            return ServiceResult<string>.FailureResult(
                $"Device '{device.DeviceName}' is not calibrated. Cannot use for readings.");
        }

        if (device.PairedOfficerId.HasValue)
        {
            return ServiceResult<string>.FailureResult(
                $"Device '{device.DeviceName}' is already paired with another officer.");
        }

        // Pair device with officer
        device.PairedOfficerId = policeofficer.OfficerId;
        device.PairingDateTime = DateTime.UtcNow;
        await _iotdeviceRepository.UpdateAsync(device);

        return ServiceResult<string>.SuccessResult(
            $"Successfully paired with device '{device.DeviceName}'. Device is ready for emission readings.");
    }
}