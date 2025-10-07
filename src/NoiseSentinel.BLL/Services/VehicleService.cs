using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Vehicle;
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
/// Service implementation for Vehicle management operations.
/// </summary>
public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly NoiseSentinelDbContext _context;

    public VehicleService(
        IVehicleRepository vehicleRepository,
        NoiseSentinelDbContext context)
    {
        _vehicleRepository = vehicleRepository;
        _context = context;
    }

    public async Task<ServiceResult<VehicleResponseDto>> CreateVehicleAsync(
        CreateVehicleDto dto, int creatorUserId)
    {
        // Verify creator is Police Officer or Station Authority
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Police Officer" &&
            creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                "Only Police Officers and Station Authority can create vehicles.");
        }

        // Check if plate number already exists
        var plateExists = await _vehicleRepository.PlateNumberExistsAsync(dto.PlateNumber);
        if (plateExists)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                $"Vehicle with plate number '{dto.PlateNumber}' already exists.");
        }

        // Validate registration year is not in future
        if (dto.VehRegYear.HasValue && dto.VehRegYear.Value > DateTime.UtcNow)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                "Vehicle registration year cannot be in the future.");
        }

        // Validate owner exists (if provided)
        if (dto.OwnerId.HasValue)
        {
            var ownerExists = await _context.Accuseds.AnyAsync(a => a.AccusedId == dto.OwnerId.Value);
            if (!ownerExists)
            {
                return ServiceResult<VehicleResponseDto>.FailureResult(
                    $"Owner with ID {dto.OwnerId.Value} not found.");
            }
        }

        // Create vehicle
        var vehicle = new Vehicle
        {
            PlateNumber = dto.PlateNumber.ToUpper(),
            Make = dto.Make,
            Color = dto.Color,
            ChasisNo = dto.ChasisNo,
            EngineNo = dto.EngineNo,
            VehRegYear = dto.VehRegYear,
            OwnerId = dto.OwnerId
        };

        var vehicleId = await _vehicleRepository.CreateAsync(vehicle);

        // Retrieve created vehicle
        var createdVehicle = await _vehicleRepository.GetByIdAsync(vehicleId);

        var response = new VehicleResponseDto
        {
            VehicleId = createdVehicle!.VehicleId,
            PlateNumber = createdVehicle.PlateNumber ?? string.Empty,
            Make = createdVehicle.Make,
            Color = createdVehicle.Color,
            ChasisNo = createdVehicle.ChasisNo,
            EngineNo = createdVehicle.EngineNo,
            VehRegYear = createdVehicle.VehRegYear,
            OwnerId = createdVehicle.OwnerId,
            OwnerName = createdVehicle.Owner?.FullName,
            OwnerCnic = createdVehicle.Owner?.Cnic,
            OwnerContact = createdVehicle.Owner?.Contact,
            TotalViolations = createdVehicle.Challans?.Count ?? 0
        };

        return ServiceResult<VehicleResponseDto>.SuccessResult(
            response,
            $"Vehicle '{dto.PlateNumber}' registered successfully.");
    }

    public async Task<ServiceResult<VehicleResponseDto>> GetVehicleByIdAsync(int vehicleId)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(vehicleId);

        if (vehicle == null)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                $"Vehicle with ID {vehicleId} not found.");
        }

        var response = new VehicleResponseDto
        {
            VehicleId = vehicle.VehicleId,
            PlateNumber = vehicle.PlateNumber ?? string.Empty,
            Make = vehicle.Make,
            Color = vehicle.Color,
            ChasisNo = vehicle.ChasisNo,
            EngineNo = vehicle.EngineNo,
            VehRegYear = vehicle.VehRegYear,
            OwnerId = vehicle.OwnerId,
            OwnerName = vehicle.Owner?.FullName,
            OwnerCnic = vehicle.Owner?.Cnic,
            OwnerContact = vehicle.Owner?.Contact,
            TotalViolations = vehicle.Challans?.Count ?? 0
        };

        return ServiceResult<VehicleResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<VehicleResponseDto>> GetVehicleByPlateNumberAsync(string plateNumber)
    {
        var vehicle = await _vehicleRepository.GetByPlateNumberAsync(plateNumber);

        if (vehicle == null)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                $"Vehicle with plate number '{plateNumber}' not found.");
        }

        var response = new VehicleResponseDto
        {
            VehicleId = vehicle.VehicleId,
            PlateNumber = vehicle.PlateNumber ?? string.Empty,
            Make = vehicle.Make,
            Color = vehicle.Color,
            ChasisNo = vehicle.ChasisNo,
            EngineNo = vehicle.EngineNo,
            VehRegYear = vehicle.VehRegYear,
            OwnerId = vehicle.OwnerId,
            OwnerName = vehicle.Owner?.FullName,
            OwnerCnic = vehicle.Owner?.Cnic,
            OwnerContact = vehicle.Owner?.Contact,
            TotalViolations = vehicle.Challans?.Count ?? 0
        };

        return ServiceResult<VehicleResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<VehicleListItemDto>>> GetAllVehiclesAsync()
    {
        var vehicles = await _vehicleRepository.GetAllAsync();

        var response = vehicles.Select(v => new VehicleListItemDto
        {
            VehicleId = v.VehicleId,
            PlateNumber = v.PlateNumber ?? string.Empty,
            Make = v.Make,
            Color = v.Color,
            OwnerName = v.Owner?.FullName,
            TotalViolations = v.Challans?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<VehicleListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<VehicleListItemDto>>> GetVehiclesByOwnerAsync(int ownerId)
    {
        var vehicles = await _vehicleRepository.GetByOwnerAsync(ownerId);

        var response = vehicles.Select(v => new VehicleListItemDto
        {
            VehicleId = v.VehicleId,
            PlateNumber = v.PlateNumber ?? string.Empty,
            Make = v.Make,
            Color = v.Color,
            OwnerName = v.Owner?.FullName,
            TotalViolations = v.Challans?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<VehicleListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<VehicleListItemDto>>> SearchVehiclesByMakeAsync(string make)
    {
        var vehicles = await _vehicleRepository.SearchByMakeAsync(make);

        var response = vehicles.Select(v => new VehicleListItemDto
        {
            VehicleId = v.VehicleId,
            PlateNumber = v.PlateNumber ?? string.Empty,
            Make = v.Make,
            Color = v.Color,
            OwnerName = v.Owner?.FullName,
            TotalViolations = v.Challans?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<VehicleListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<VehicleResponseDto>> UpdateVehicleAsync(
        UpdateVehicleDto dto, int updaterUserId)
    {
        // Verify updater is Station Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                "Only Station Authority can update vehicles.");
        }

        // Check if vehicle exists
        var existingVehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId);
        if (existingVehicle == null)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                $"Vehicle with ID {dto.VehicleId} not found.");
        }

        // Check if new plate number already exists (excluding current vehicle)
        var plateExists = await _vehicleRepository
            .PlateNumberExistsAsync(dto.PlateNumber, dto.VehicleId);

        if (plateExists)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                $"Vehicle with plate number '{dto.PlateNumber}' already exists.");
        }

        // Validate registration year
        if (dto.VehRegYear.HasValue && dto.VehRegYear.Value > DateTime.UtcNow)
        {
            return ServiceResult<VehicleResponseDto>.FailureResult(
                "Vehicle registration year cannot be in the future.");
        }

        // Update vehicle
        existingVehicle.PlateNumber = dto.PlateNumber.ToUpper();
        existingVehicle.Make = dto.Make;
        existingVehicle.Color = dto.Color;
        existingVehicle.ChasisNo = dto.ChasisNo;
        existingVehicle.EngineNo = dto.EngineNo;
        existingVehicle.VehRegYear = dto.VehRegYear;
        existingVehicle.OwnerId = dto.OwnerId;

        await _vehicleRepository.UpdateAsync(existingVehicle);

        // Retrieve updated vehicle
        var updatedVehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId);

        var response = new VehicleResponseDto
        {
            VehicleId = updatedVehicle!.VehicleId,
            PlateNumber = updatedVehicle.PlateNumber ?? string.Empty,
            Make = updatedVehicle.Make,
            Color = updatedVehicle.Color,
            ChasisNo = updatedVehicle.ChasisNo,
            EngineNo = updatedVehicle.EngineNo,
            VehRegYear = updatedVehicle.VehRegYear,
            OwnerId = updatedVehicle.OwnerId,
            OwnerName = updatedVehicle.Owner?.FullName,
            OwnerCnic = updatedVehicle.Owner?.Cnic,
            OwnerContact = updatedVehicle.Owner?.Contact,
            TotalViolations = updatedVehicle.Challans?.Count ?? 0
        };

        return ServiceResult<VehicleResponseDto>.SuccessResult(
            response,
            $"Vehicle '{dto.PlateNumber}' updated successfully.");
    }

    public async Task<ServiceResult<string>> DeleteVehicleAsync(int vehicleId, int deleterUserId)
    {
        // Verify deleter is Station Authority
        var deleter = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == deleterUserId);

        if (deleter?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<string>.FailureResult(
                "Only Station Authority can delete vehicles.");
        }

        // Check if vehicle exists
        var vehicle = await _vehicleRepository.GetByIdAsync(vehicleId);
        if (vehicle == null)
        {
            return ServiceResult<string>.FailureResult(
                $"Vehicle with ID {vehicleId} not found.");
        }

        // Check if vehicle has challans
        var violationCount = await _vehicleRepository.GetViolationCountAsync(vehicleId);
        if (violationCount > 0)
        {
            return ServiceResult<string>.FailureResult(
                $"Cannot delete vehicle '{vehicle.PlateNumber}' because it has {violationCount} violation(s) linked.");
        }

        var plateNumber = vehicle.PlateNumber;
        var deleted = await _vehicleRepository.DeleteAsync(vehicleId);

        if (!deleted)
        {
            return ServiceResult<string>.FailureResult("Failed to delete vehicle.");
        }

        return ServiceResult<string>.SuccessResult(
            $"Vehicle '{plateNumber}' deleted successfully.");
    }

    public async Task<ServiceResult<Vehicle>> GetOrCreateVehicleAsync(VehicleInputDto dto, int? ownerId = null)
    {
        // Check if vehicle exists by plate number
        var existingVehicle = await _vehicleRepository.GetByPlateNumberAsync(dto.PlateNumber);

        if (existingVehicle != null)
        {
            // Vehicle exists, update owner if provided and owner is null
            if (ownerId.HasValue && existingVehicle.OwnerId == null)
            {
                existingVehicle.OwnerId = ownerId.Value;
                await _vehicleRepository.UpdateAsync(existingVehicle);
            }

            return ServiceResult<Vehicle>.SuccessResult(existingVehicle);
        }

        // Vehicle doesn't exist, create new
        var newVehicle = new Vehicle
        {
            PlateNumber = dto.PlateNumber.ToUpper(),
            Make = dto.Make,
            Color = dto.Color,
            ChasisNo = dto.ChasisNo,
            EngineNo = dto.EngineNo,
            VehRegYear = dto.VehRegYear,
            OwnerId = ownerId
        };

        await _vehicleRepository.CreateAsync(newVehicle);

        return ServiceResult<Vehicle>.SuccessResult(newVehicle);
    }
}