using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Accused;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for Accused management operations.
/// </summary>
public class AccusedService : IAccusedService
{
    private readonly IAccusedRepository _accusedRepository;
    private readonly NoiseSentinelDbContext _context;

    public AccusedService(
        IAccusedRepository accusedRepository,
        NoiseSentinelDbContext context)
    {
        _accusedRepository = accusedRepository;
        _context = context;
    }

    public async Task<ServiceResult<AccusedResponseDto>> CreateAccusedAsync(
        CreateAccusedDto dto, int creatorUserId)
    {
        // Verify creator is Police Officer or Station Authority
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Police Officer" &&
            creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                "Only Police Officers and Station Authority can create accused records.");
        }

        // Check if CNIC already exists
        var cnicExists = await _accusedRepository.CnicExistsAsync(dto.Cnic);
        if (cnicExists)
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                $"Person with CNIC '{dto.Cnic}' already exists in the system.");
        }

        // Create accused
        var accused = new Accused
        {
            FullName = dto.FullName,
            Cnic = dto.Cnic,
            City = dto.City,
            Province = dto.Province,
            Address = dto.Address,
            Contact = dto.Contact
        };

        var accusedId = await _accusedRepository.CreateAsync(accused);

        // Retrieve created accused
        var createdAccused = await _accusedRepository.GetByIdAsync(accusedId);

        var response = new AccusedResponseDto
        {
            AccusedId = createdAccused!.AccusedId,
            FullName = createdAccused.FullName ?? string.Empty,
            Cnic = createdAccused.Cnic ?? string.Empty,
            City = createdAccused.City,
            Province = createdAccused.Province,
            Address = createdAccused.Address,
            Contact = createdAccused.Contact,
            TotalViolations = createdAccused.Challans?.Count ?? 0,
            TotalVehicles = createdAccused.Vehicles?.Count ?? 0,
            Vehicles = createdAccused.Vehicles?.Select(v => new AccusedVehicleSummaryDto
            {
                VehicleId = v.VehicleId,
                PlateNumber = v.PlateNumber ?? string.Empty,
                Make = v.Make,
                Color = v.Color
            }).ToList() ?? new List<AccusedVehicleSummaryDto>()
        };

        return ServiceResult<AccusedResponseDto>.SuccessResult(
            response,
            $"Person '{dto.FullName}' (CNIC: {dto.Cnic}) registered successfully.");
    }

    public async Task<ServiceResult<AccusedResponseDto>> GetAccusedByIdAsync(int accusedId)
    {
        var accused = await _accusedRepository.GetByIdAsync(accusedId);

        if (accused == null)
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                $"Person with ID {accusedId} not found.");
        }

        var response = new AccusedResponseDto
        {
            AccusedId = accused.AccusedId,
            FullName = accused.FullName ?? string.Empty,
            Cnic = accused.Cnic ?? string.Empty,
            City = accused.City,
            Province = accused.Province,
            Address = accused.Address,
            Contact = accused.Contact,
            TotalViolations = accused.Challans?.Count ?? 0,
            TotalVehicles = accused.Vehicles?.Count ?? 0,
            Vehicles = accused.Vehicles?.Select(v => new AccusedVehicleSummaryDto
            {
                VehicleId = v.VehicleId,
                PlateNumber = v.PlateNumber ?? string.Empty,
                Make = v.Make,
                Color = v.Color
            }).ToList() ?? new List<AccusedVehicleSummaryDto>()
        };

        return ServiceResult<AccusedResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<AccusedResponseDto>> GetAccusedByCnicAsync(string cnic)
    {
        var accused = await _accusedRepository.GetByCnicAsync(cnic);

        if (accused == null)
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                $"Person with CNIC '{cnic}' not found.");
        }

        var response = new AccusedResponseDto
        {
            AccusedId = accused.AccusedId,
            FullName = accused.FullName ?? string.Empty,
            Cnic = accused.Cnic ?? string.Empty,
            City = accused.City,
            Province = accused.Province,
            Address = accused.Address,
            Contact = accused.Contact,
            TotalViolations = accused.Challans?.Count ?? 0,
            TotalVehicles = accused.Vehicles?.Count ?? 0,
            Vehicles = accused.Vehicles?.Select(v => new AccusedVehicleSummaryDto
            {
                VehicleId = v.VehicleId,
                PlateNumber = v.PlateNumber ?? string.Empty,
                Make = v.Make,
                Color = v.Color
            }).ToList() ?? new List<AccusedVehicleSummaryDto>()
        };

        return ServiceResult<AccusedResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<AccusedListItemDto>>> GetAllAccusedAsync()
    {
        var accusedList = await _accusedRepository.GetAllAsync();

        var response = accusedList.Select(a => new AccusedListItemDto
        {
            AccusedId = a.AccusedId,
            FullName = a.FullName ?? string.Empty,
            Cnic = a.Cnic ?? string.Empty,
            City = a.City,
            Province = a.Province,
            Contact = a.Contact,
            TotalViolations = a.Challans?.Count ?? 0,
            TotalVehicles = a.Vehicles?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<AccusedListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<AccusedListItemDto>>> SearchAccusedByNameAsync(string name)
    {
        var accusedList = await _accusedRepository.SearchByNameAsync(name);

        var response = accusedList.Select(a => new AccusedListItemDto
        {
            AccusedId = a.AccusedId,
            FullName = a.FullName ?? string.Empty,
            Cnic = a.Cnic ?? string.Empty,
            City = a.City,
            Province = a.Province,
            Contact = a.Contact,
            TotalViolations = a.Challans?.Count ?? 0,
            TotalVehicles = a.Vehicles?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<AccusedListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<AccusedListItemDto>>> GetAccusedByProvinceAsync(string province)
    {
        var accusedList = await _accusedRepository.GetByProvinceAsync(province);

        var response = accusedList.Select(a => new AccusedListItemDto
        {
            AccusedId = a.AccusedId,
            FullName = a.FullName ?? string.Empty,
            Cnic = a.Cnic ?? string.Empty,
            City = a.City,
            Province = a.Province,
            Contact = a.Contact,
            TotalViolations = a.Challans?.Count ?? 0,
            TotalVehicles = a.Vehicles?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<AccusedListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<AccusedListItemDto>>> GetAccusedByCityAsync(string city)
    {
        var accusedList = await _accusedRepository.GetByCityAsync(city);

        var response = accusedList.Select(a => new AccusedListItemDto
        {
            AccusedId = a.AccusedId,
            FullName = a.FullName ?? string.Empty,
            Cnic = a.Cnic ?? string.Empty,
            City = a.City,
            Province = a.Province,
            Contact = a.Contact,
            TotalViolations = a.Challans?.Count ?? 0,
            TotalVehicles = a.Vehicles?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<AccusedListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<AccusedResponseDto>> UpdateAccusedAsync(
        UpdateAccusedDto dto, int updaterUserId)
    {
        // Verify updater is Station Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                "Only Station Authority can update accused records.");
        }

        // Check if accused exists
        var existingAccused = await _accusedRepository.GetByIdAsync(dto.AccusedId);
        if (existingAccused == null)
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                $"Person with ID {dto.AccusedId} not found.");
        }

        // Check if new CNIC already exists (excluding current accused)
        var cnicExists = await _accusedRepository.CnicExistsAsync(dto.Cnic, dto.AccusedId);

        if (cnicExists)
        {
            return ServiceResult<AccusedResponseDto>.FailureResult(
                $"Person with CNIC '{dto.Cnic}' already exists.");
        }

        // Update accused
        existingAccused.FullName = dto.FullName;
        existingAccused.Cnic = dto.Cnic;
        existingAccused.City = dto.City;
        existingAccused.Province = dto.Province;
        existingAccused.Address = dto.Address;
        existingAccused.Contact = dto.Contact;

        await _accusedRepository.UpdateAsync(existingAccused);

        // Retrieve updated accused
        var updatedAccused = await _accusedRepository.GetByIdAsync(dto.AccusedId);

        var response = new AccusedResponseDto
        {
            AccusedId = updatedAccused!.AccusedId,
            FullName = updatedAccused.FullName ?? string.Empty,
            Cnic = updatedAccused.Cnic ?? string.Empty,
            City = updatedAccused.City,
            Province = updatedAccused.Province,
            Address = updatedAccused.Address,
            Contact = updatedAccused.Contact,
            TotalViolations = updatedAccused.Challans?.Count ?? 0,
            TotalVehicles = updatedAccused.Vehicles?.Count ?? 0,
            Vehicles = updatedAccused.Vehicles?.Select(v => new AccusedVehicleSummaryDto
            {
                VehicleId = v.VehicleId,
                PlateNumber = v.PlateNumber ?? string.Empty,
                Make = v.Make,
                Color = v.Color
            }).ToList() ?? new List<AccusedVehicleSummaryDto>()
        };

        return ServiceResult<AccusedResponseDto>.SuccessResult(
            response,
            $"Person '{dto.FullName}' updated successfully.");
    }

    public async Task<ServiceResult<string>> DeleteAccusedAsync(int accusedId, int deleterUserId)
    {
        // Verify deleter is Station Authority
        var deleter = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == deleterUserId);

        if (deleter?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<string>.FailureResult(
                "Only Station Authority can delete accused records.");
        }

        // Check if accused exists
        var accused = await _accusedRepository.GetByIdAsync(accusedId);
        if (accused == null)
        {
            return ServiceResult<string>.FailureResult(
                $"Person with ID {accusedId} not found.");
        }

        // Check if accused has challans
        var violationCount = await _accusedRepository.GetViolationCountAsync(accusedId);
        if (violationCount > 0)
        {
            return ServiceResult<string>.FailureResult(
                $"Cannot delete person '{accused.FullName}' because they have {violationCount} violation(s) linked.");
        }

        // Check if accused has vehicles
        var vehicleCount = await _accusedRepository.GetVehicleCountAsync(accusedId);
        if (vehicleCount > 0)
        {
            return ServiceResult<string>.FailureResult(
                $"Cannot delete person '{accused.FullName}' because they own {vehicleCount} vehicle(s).");
        }

        var fullName = accused.FullName;
        var deleted = await _accusedRepository.DeleteAsync(accusedId);

        if (!deleted)
        {
            return ServiceResult<string>.FailureResult("Failed to delete person.");
        }

        return ServiceResult<string>.SuccessResult(
            $"Person '{fullName}' deleted successfully.");
    }

    public async Task<ServiceResult<Accused>> GetOrCreateAccusedAsync(AccusedInputDto dto)
    {
        // Check if accused exists by CNIC
        var existingAccused = await _accusedRepository.GetByCnicAsync(dto.Cnic);

        if (existingAccused != null)
        {
            // Accused exists, update contact info if changed
            bool needsUpdate = false;

            if (existingAccused.Contact != dto.Contact)
            {
                existingAccused.Contact = dto.Contact;
                needsUpdate = true;
            }

            if (existingAccused.Address != dto.Address)
            {
                existingAccused.Address = dto.Address;
                needsUpdate = true;
            }

            if (needsUpdate)
            {
                await _accusedRepository.UpdateAsync(existingAccused);
            }

            return ServiceResult<Accused>.SuccessResult(existingAccused);
        }

        // Accused doesn't exist, create new
        var newAccused = new Accused
        {
            FullName = dto.FullName,
            Cnic = dto.Cnic,
            City = dto.City,
            Province = dto.Province,
            Address = dto.Address,
            Contact = dto.Contact
        };

        await _accusedRepository.CreateAsync(newAccused);

        return ServiceResult<Accused>.SuccessResult(newAccused);
    }
}