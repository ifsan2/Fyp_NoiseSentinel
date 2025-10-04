using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Policestation;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for Police Station management operations.
/// </summary>
public class PolicestationService : IPolicestationService
{
    private readonly IPolicestationRepository _policestationRepository;
    private readonly NoiseSentinelDbContext _context;

    public PolicestationService(
        IPolicestationRepository policestationRepository,
        NoiseSentinelDbContext context)
    {
        _policestationRepository = policestationRepository;
        _context = context;
    }

    public async Task<ServiceResult<PolicestationResponseDto>> CreatePolicestationAsync(
        CreatePolicestationDto dto, int creatorUserId)
    {
        // Verify creator is Station Authority
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                "Only Station Authority users can create police stations.");
        }

        // Check if station name already exists in the same province
        var nameExists = await _policestationRepository.StationNameExistsAsync(dto.StationName, dto.Province);
        if (nameExists)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"A police station with the name '{dto.StationName}' already exists in {dto.Province}.");
        }

        // Check if station code already exists
        var codeExists = await _policestationRepository.StationCodeExistsAsync(dto.StationCode);
        if (codeExists)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"Station code '{dto.StationCode}' is already in use.");
        }

        // Create police station
        var station = new Policestation
        {
            StationName = dto.StationName,
            StationCode = dto.StationCode,
            Location = dto.Location,
            District = dto.District,
            Province = dto.Province,
            Contact = dto.Contact
        };

        var stationId = await _policestationRepository.CreateAsync(station);

        // Retrieve created station with navigation properties
        var createdStation = await _policestationRepository.GetByIdAsync(stationId);

        var response = new PolicestationResponseDto
        {
            StationId = createdStation!.StationId,
            StationName = createdStation.StationName ?? string.Empty,
            StationCode = createdStation.StationCode ?? string.Empty,
            Location = createdStation.Location ?? string.Empty,
            District = createdStation.District ?? string.Empty,
            Province = createdStation.Province ?? string.Empty,
            Contact = createdStation.Contact,
            TotalOfficers = createdStation.Policeofficers?.Count ?? 0,
            Officers = createdStation.Policeofficers?.Select(o => new OfficerSummaryDto
            {
                OfficerId = o.OfficerId,
                FullName = o.User?.FullName ?? string.Empty,
                BadgeNumber = o.BadgeNumber ?? string.Empty,
                Rank = o.Rank,
                IsInvestigationOfficer = o.IsInvestigationOfficer ?? false
            }).ToList() ?? new List<OfficerSummaryDto>()  // ✅ Fixed: Added null-coalescing
        };

        return ServiceResult<PolicestationResponseDto>.SuccessResult(
            response,
            $"Police station '{dto.StationName}' created successfully.");
    }

    public async Task<ServiceResult<PolicestationResponseDto>> GetPolicestationByIdAsync(int stationId)
    {
        var station = await _policestationRepository.GetByIdAsync(stationId);

        if (station == null)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"Police station with ID {stationId} not found.");
        }

        var response = new PolicestationResponseDto
        {
            StationId = station.StationId,
            StationName = station.StationName ?? string.Empty,
            StationCode = station.StationCode ?? string.Empty,
            Location = station.Location ?? string.Empty,
            District = station.District ?? string.Empty,
            Province = station.Province ?? string.Empty,
            Contact = station.Contact,
            TotalOfficers = station.Policeofficers?.Count ?? 0,
            Officers = station.Policeofficers?.Select(o => new OfficerSummaryDto
            {
                OfficerId = o.OfficerId,
                FullName = o.User?.FullName ?? string.Empty,
                BadgeNumber = o.BadgeNumber ?? string.Empty,
                Rank = o.Rank,
                IsInvestigationOfficer = o.IsInvestigationOfficer ?? false
            }).ToList() ?? new List<OfficerSummaryDto>()  // ✅ Fixed: Added null-coalescing
        };

        return ServiceResult<PolicestationResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<PolicestationListItemDto>>> GetAllPolicestationsAsync()
    {
        var stations = await _policestationRepository.GetAllAsync();

        var response = stations.Select(s => new PolicestationListItemDto
        {
            StationId = s.StationId,
            StationName = s.StationName ?? string.Empty,
            StationCode = s.StationCode ?? string.Empty,
            Location = s.Location ?? string.Empty,
            District = s.District ?? string.Empty,
            Province = s.Province ?? string.Empty,
            Contact = s.Contact,
            TotalOfficers = s.Policeofficers?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<PolicestationListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<PolicestationListItemDto>>> GetPolicestationsByProvinceAsync(string province)
    {
        var stations = await _policestationRepository.GetByProvinceAsync(province);

        var response = stations.Select(s => new PolicestationListItemDto
        {
            StationId = s.StationId,
            StationName = s.StationName ?? string.Empty,
            StationCode = s.StationCode ?? string.Empty,
            Location = s.Location ?? string.Empty,
            District = s.District ?? string.Empty,
            Province = s.Province ?? string.Empty,
            Contact = s.Contact,
            TotalOfficers = s.Policeofficers?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<PolicestationListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<PolicestationResponseDto>> GetPolicestationByCodeAsync(string stationCode)
    {
        var station = await _policestationRepository.GetByStationCodeAsync(stationCode);

        if (station == null)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"Police station with code '{stationCode}' not found.");
        }

        var response = new PolicestationResponseDto
        {
            StationId = station.StationId,
            StationName = station.StationName ?? string.Empty,
            StationCode = station.StationCode ?? string.Empty,
            Location = station.Location ?? string.Empty,
            District = station.District ?? string.Empty,
            Province = station.Province ?? string.Empty,
            Contact = station.Contact,
            TotalOfficers = station.Policeofficers?.Count ?? 0,
            Officers = station.Policeofficers?.Select(o => new OfficerSummaryDto
            {
                OfficerId = o.OfficerId,
                FullName = o.User?.FullName ?? string.Empty,
                BadgeNumber = o.BadgeNumber ?? string.Empty,
                Rank = o.Rank,
                IsInvestigationOfficer = o.IsInvestigationOfficer ?? false
            }).ToList() ?? new List<OfficerSummaryDto>()  // ✅ Fixed: Added null-coalescing
        };

        return ServiceResult<PolicestationResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<PolicestationResponseDto>> UpdatePolicestationAsync(
        UpdatePolicestationDto dto, int updaterUserId)
    {
        // Verify updater is Station Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                "Only Station Authority users can update police stations.");
        }

        // Check if station exists
        var existingStation = await _policestationRepository.GetByIdAsync(dto.StationId);
        if (existingStation == null)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"Police station with ID {dto.StationId} not found.");
        }

        // Check if new station name already exists (excluding current station)
        var nameExists = await _policestationRepository.StationNameExistsAsync(
            dto.StationName,
            dto.Province,
            dto.StationId);

        if (nameExists)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"A police station with the name '{dto.StationName}' already exists in {dto.Province}.");
        }

        // Check if new station code already exists (excluding current station)
        var codeExists = await _policestationRepository.StationCodeExistsAsync(
            dto.StationCode,
            dto.StationId);

        if (codeExists)
        {
            return ServiceResult<PolicestationResponseDto>.FailureResult(
                $"Station code '{dto.StationCode}' is already in use.");
        }

        // Update station
        existingStation.StationName = dto.StationName;
        existingStation.StationCode = dto.StationCode;
        existingStation.Location = dto.Location;
        existingStation.District = dto.District;
        existingStation.Province = dto.Province;
        existingStation.Contact = dto.Contact;

        await _policestationRepository.UpdateAsync(existingStation);

        // Retrieve updated station
        var updatedStation = await _policestationRepository.GetByIdAsync(dto.StationId);

        var response = new PolicestationResponseDto
        {
            StationId = updatedStation!.StationId,
            StationName = updatedStation.StationName ?? string.Empty,
            StationCode = updatedStation.StationCode ?? string.Empty,
            Location = updatedStation.Location ?? string.Empty,
            District = updatedStation.District ?? string.Empty,
            Province = updatedStation.Province ?? string.Empty,
            Contact = updatedStation.Contact,
            TotalOfficers = updatedStation.Policeofficers?.Count ?? 0,
            Officers = updatedStation.Policeofficers?.Select(o => new OfficerSummaryDto
            {
                OfficerId = o.OfficerId,
                FullName = o.User?.FullName ?? string.Empty,
                BadgeNumber = o.BadgeNumber ?? string.Empty,
                Rank = o.Rank,
                IsInvestigationOfficer = o.IsInvestigationOfficer ?? false
            }).ToList() ?? new List<OfficerSummaryDto>()  // ✅ Fixed: Added null-coalescing
        };

        return ServiceResult<PolicestationResponseDto>.SuccessResult(
            response,
            $"Police station '{dto.StationName}' updated successfully.");
    }

    public async Task<ServiceResult<string>> DeletePolicestationAsync(int stationId, int deleterUserId)
    {
        // Verify deleter is Admin
        var deleter = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == deleterUserId);

        if (deleter?.Role?.RoleName != "Admin")
        {
            return ServiceResult<string>.FailureResult(
                "Only Admin users can delete police stations.");
        }

        // Check if station exists
        var station = await _policestationRepository.GetByIdAsync(stationId);
        if (station == null)
        {
            return ServiceResult<string>.FailureResult(
                $"Police station with ID {stationId} not found.");
        }

        // Check if station has officers (with null check)
        var officerCount = station.Policeofficers?.Count ?? 0;
        if (officerCount > 0)
        {
            return ServiceResult<string>.FailureResult(
                $"Cannot delete police station '{station.StationName}' because it has {officerCount} officer(s) assigned. Please reassign or remove officers first.");
        }

        var stationName = station.StationName;
        var deleted = await _policestationRepository.DeleteAsync(stationId);

        if (!deleted)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to delete police station.");
        }

        return ServiceResult<string>.SuccessResult(
            $"Police station '{stationName}' deleted successfully.");
    }
}