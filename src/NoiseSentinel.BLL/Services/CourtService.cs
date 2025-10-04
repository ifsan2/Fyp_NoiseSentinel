using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Court;
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
/// Service implementation for Court management operations.
/// </summary>
public class CourtService : ICourtService
{
    private readonly ICourtRepository _courtRepository;
    private readonly ICourttypeRepository _courttypeRepository;
    private readonly NoiseSentinelDbContext _context;

    public CourtService(
        ICourtRepository courtRepository,
        ICourttypeRepository courttypeRepository,
        NoiseSentinelDbContext context)
    {
        _courtRepository = courtRepository;
        _courttypeRepository = courttypeRepository;
        _context = context;
    }

    public async Task<ServiceResult<CourtResponseDto>> CreateCourtAsync(CreateCourtDto dto, int creatorUserId)
    {
        // Verify creator is Court Authority
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Court Authority")
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                "Only Court Authority users can create courts.");
        }

        // Validate court type exists
        var courtTypeExists = await _courttypeRepository.ExistsAsync(dto.CourtTypeId);
        if (!courtTypeExists)
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                $"Court type with ID {dto.CourtTypeId} does not exist.");
        }

        // Check if court name already exists in the same province
        var nameExists = await _courtRepository.CourtNameExistsAsync(dto.CourtName, dto.Province);
        if (nameExists)
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                $"A court with the name '{dto.CourtName}' already exists in {dto.Province}.");
        }

        // Create court
        var court = new Court
        {
            CourtName = dto.CourtName,
            CourtTypeId = dto.CourtTypeId,
            Location = dto.Location,
            District = dto.District,
            Province = dto.Province
        };

        var courtId = await _courtRepository.CreateAsync(court);

        // Retrieve created court with navigation properties
        var createdCourt = await _courtRepository.GetByIdAsync(courtId);

        var response = new CourtResponseDto
        {
            CourtId = createdCourt!.CourtId,
            CourtName = createdCourt.CourtName ?? string.Empty,
            CourtTypeId = createdCourt.CourtTypeId ?? 0,
            CourtTypeName = createdCourt.CourtType?.CourtTypeName ?? string.Empty,
            Location = createdCourt.Location ?? string.Empty,
            District = createdCourt.District ?? string.Empty,
            Province = createdCourt.Province ?? string.Empty,
            TotalJudges = createdCourt.Judges.Count,
            Judges = createdCourt.Judges.Select(j => new JudgeSummaryDto
            {
                JudgeId = j.JudgeId,
                FullName = j.User?.FullName ?? string.Empty,
                Rank = j.Rank,
                ServiceStatus = j.ServiceStatus ?? false
            }).ToList()
        };

        return ServiceResult<CourtResponseDto>.SuccessResult(
            response,
            $"Court '{dto.CourtName}' created successfully.");
    }

    public async Task<ServiceResult<CourtResponseDto>> GetCourtByIdAsync(int courtId)
    {
        var court = await _courtRepository.GetByIdAsync(courtId);

        if (court == null)
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                $"Court with ID {courtId} not found.");
        }

        var response = new CourtResponseDto
        {
            CourtId = court.CourtId,
            CourtName = court.CourtName ?? string.Empty,
            CourtTypeId = court.CourtTypeId ?? 0,
            CourtTypeName = court.CourtType?.CourtTypeName ?? string.Empty,
            Location = court.Location ?? string.Empty,
            District = court.District ?? string.Empty,
            Province = court.Province ?? string.Empty,
            TotalJudges = court.Judges.Count,
            Judges = court.Judges.Select(j => new JudgeSummaryDto
            {
                JudgeId = j.JudgeId,
                FullName = j.User?.FullName ?? string.Empty,
                Rank = j.Rank,
                ServiceStatus = j.ServiceStatus ?? false
            }).ToList()
        };

        return ServiceResult<CourtResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CourtListItemDto>>> GetAllCourtsAsync()
    {
        var courts = await _courtRepository.GetAllAsync();

        var response = courts.Select(c => new CourtListItemDto
        {
            CourtId = c.CourtId,
            CourtName = c.CourtName ?? string.Empty,
            CourtTypeName = c.CourtType?.CourtTypeName ?? string.Empty,
            Location = c.Location ?? string.Empty,
            District = c.District ?? string.Empty,
            Province = c.Province ?? string.Empty,
            TotalJudges = c.Judges?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<CourtListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CourtListItemDto>>> GetCourtsByTypeAsync(int courtTypeId)
    {
        // Validate court type exists
        var courtTypeExists = await _courttypeRepository.ExistsAsync(courtTypeId);
        if (!courtTypeExists)
        {
            return ServiceResult<IEnumerable<CourtListItemDto>>.FailureResult(
                $"Court type with ID {courtTypeId} does not exist.");
        }

        var courts = await _courtRepository.GetByTypeAsync(courtTypeId);

        var response = courts.Select(c => new CourtListItemDto
        {
            CourtId = c.CourtId,
            CourtName = c.CourtName ?? string.Empty,
            CourtTypeName = c.CourtType?.CourtTypeName ?? string.Empty,
            Location = c.Location ?? string.Empty,
            District = c.District ?? string.Empty,
            Province = c.Province ?? string.Empty,
            TotalJudges = c.Judges?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<CourtListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<CourtListItemDto>>> GetCourtsByProvinceAsync(string province)
    {
        var courts = await _courtRepository.GetByProvinceAsync(province);

        var response = courts.Select(c => new CourtListItemDto
        {
            CourtId = c.CourtId,
            CourtName = c.CourtName ?? string.Empty,
            CourtTypeName = c.CourtType?.CourtTypeName ?? string.Empty,
            Location = c.Location ?? string.Empty,
            District = c.District ?? string.Empty,
            Province = c.Province ?? string.Empty,
            TotalJudges = c.Judges?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<CourtListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<CourtResponseDto>> UpdateCourtAsync(UpdateCourtDto dto, int updaterUserId)
    {
        // Verify updater is Court Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Court Authority")
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                "Only Court Authority users can update courts.");
        }

        // Check if court exists
        var existingCourt = await _courtRepository.GetByIdAsync(dto.CourtId);
        if (existingCourt == null)
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                $"Court with ID {dto.CourtId} not found.");
        }

        // Validate court type exists
        var courtTypeExists = await _courttypeRepository.ExistsAsync(dto.CourtTypeId);
        if (!courtTypeExists)
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                $"Court type with ID {dto.CourtTypeId} does not exist.");
        }

        // Check if new court name already exists (excluding current court)
        var nameExists = await _courtRepository.CourtNameExistsAsync(
            dto.CourtName,
            dto.Province,
            dto.CourtId);

        if (nameExists)
        {
            return ServiceResult<CourtResponseDto>.FailureResult(
                $"A court with the name '{dto.CourtName}' already exists in {dto.Province}.");
        }

        // Update court
        existingCourt.CourtName = dto.CourtName;
        existingCourt.CourtTypeId = dto.CourtTypeId;
        existingCourt.Location = dto.Location;
        existingCourt.District = dto.District;
        existingCourt.Province = dto.Province;

        await _courtRepository.UpdateAsync(existingCourt);

        // Retrieve updated court
        var updatedCourt = await _courtRepository.GetByIdAsync(dto.CourtId);

        var response = new CourtResponseDto
        {
            CourtId = updatedCourt!.CourtId,
            CourtName = updatedCourt.CourtName ?? string.Empty,
            CourtTypeId = updatedCourt.CourtTypeId ?? 0,
            CourtTypeName = updatedCourt.CourtType?.CourtTypeName ?? string.Empty,
            Location = updatedCourt.Location ?? string.Empty,
            District = updatedCourt.District ?? string.Empty,
            Province = updatedCourt.Province ?? string.Empty,
            TotalJudges = updatedCourt.Judges.Count,
            Judges = updatedCourt.Judges.Select(j => new JudgeSummaryDto
            {
                JudgeId = j.JudgeId,
                FullName = j.User?.FullName ?? string.Empty,
                Rank = j.Rank,
                ServiceStatus = j.ServiceStatus ?? false
            }).ToList()
        };

        return ServiceResult<CourtResponseDto>.SuccessResult(
            response,
            $"Court '{dto.CourtName}' updated successfully.");
    }

    public async Task<ServiceResult<string>> DeleteCourtAsync(int courtId, int deleterUserId)
    {
        // Verify deleter is Admin
        var deleter = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == deleterUserId);

        if (deleter?.Role?.RoleName != "Admin")
        {
            return ServiceResult<string>.FailureResult(
                "Only Admin users can delete courts.");
        }

        // Check if court exists
        var court = await _courtRepository.GetByIdAsync(courtId);
        if (court == null)
        {
            return ServiceResult<string>.FailureResult(
                $"Court with ID {courtId} not found.");
        }

        // Check if court has judges
        if (court.Judges.Any())
        {
            return ServiceResult<string>.FailureResult(
                $"Cannot delete court '{court.CourtName}' because it has {court.Judges.Count} judge(s) assigned. Please reassign or remove judges first.");
        }

        var courtName = court.CourtName;
        var deleted = await _courtRepository.DeleteAsync(courtId);

        if (!deleted)
        {
            return ServiceResult<string>.FailureResult(
                "Failed to delete court.");
        }

        return ServiceResult<string>.SuccessResult(
            $"Court '{courtName}' deleted successfully.");
    }

    public async Task<ServiceResult<IEnumerable<CourttypeResponseDto>>> GetCourtTypesAsync()
    {
        var courtTypes = await _courttypeRepository.GetAllAsync();

        var response = courtTypes.Select(ct => new CourttypeResponseDto
        {
            CourtTypeId = ct.CourtTypeId,
            CourtTypeName = ct.CourtTypeName ?? string.Empty
        }).ToList();

        return ServiceResult<IEnumerable<CourttypeResponseDto>>.SuccessResult(response);
    }

    public async Task InitializeCourtTypesAsync()
    {
        var courtTypeNames = new[] { "Supreme Court", "High Court", "Civil Court" };

        foreach (var typeName in courtTypeNames)
        {
            var existing = await _courttypeRepository.GetByNameAsync(typeName);
            if (existing == null)
            {
                var courtType = new Courttype { CourtTypeName = typeName };
                await _courttypeRepository.CreateAsync(courtType);
                Console.WriteLine($"✓ Court type '{typeName}' created.");
            }
        }
    }
}