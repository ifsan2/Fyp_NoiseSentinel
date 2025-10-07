using Microsoft.EntityFrameworkCore;
using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Violation;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Service implementation for Violation management operations.
/// </summary>
public class ViolationService : IViolationService
{
    private readonly IViolationRepository _violationRepository;
    private readonly NoiseSentinelDbContext _context;

    public ViolationService(
        IViolationRepository violationRepository,
        NoiseSentinelDbContext context)
    {
        _violationRepository = violationRepository;
        _context = context;
    }

    public async Task<ServiceResult<ViolationResponseDto>> CreateViolationAsync(
        CreateViolationDto dto, int creatorUserId)
    {
        // Verify creator is Station Authority
        var creator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == creatorUserId);

        if (creator?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<ViolationResponseDto>.FailureResult(
                "Only Station Authority users can create violations.");
        }

        // Check if violation type already exists (optional - for uniqueness)
        var typeExists = await _violationRepository
            .ViolationTypeExistsAsync(dto.ViolationType);

        if (typeExists)
        {
            return ServiceResult<ViolationResponseDto>.FailureResult(
                $"A violation type with the name '{dto.ViolationType}' already exists.");
        }

        // Create violation
        var violation = new Violation
        {
            ViolationType = dto.ViolationType,
            Description = dto.Description,
            PenaltyAmount = dto.PenaltyAmount,
            SectionOfLaw = dto.SectionOfLaw,
            IsCognizable = dto.IsCognizable
        };

        var violationId = await _violationRepository.CreateAsync(violation);

        // Retrieve created violation
        var createdViolation = await _violationRepository.GetByIdAsync(violationId);

        var response = new ViolationResponseDto
        {
            ViolationId = createdViolation!.ViolationId,
            ViolationType = createdViolation.ViolationType ?? string.Empty,
            Description = createdViolation.Description ?? string.Empty,
            PenaltyAmount = createdViolation.PenaltyAmount ?? 0,
            SectionOfLaw = createdViolation.SectionOfLaw,
            IsCognizable = createdViolation.IsCognizable ?? false,
            TotalChallans = createdViolation.Challans?.Count ?? 0
        };

        return ServiceResult<ViolationResponseDto>.SuccessResult(
            response,
            $"Violation type '{dto.ViolationType}' created successfully.");
    }

    public async Task<ServiceResult<ViolationResponseDto>> GetViolationByIdAsync(int violationId)
    {
        var violation = await _violationRepository.GetByIdAsync(violationId);

        if (violation == null)
        {
            return ServiceResult<ViolationResponseDto>.FailureResult(
                $"Violation with ID {violationId} not found.");
        }

        var response = new ViolationResponseDto
        {
            ViolationId = violation.ViolationId,
            ViolationType = violation.ViolationType ?? string.Empty,
            Description = violation.Description ?? string.Empty,
            PenaltyAmount = violation.PenaltyAmount ?? 0,
            SectionOfLaw = violation.SectionOfLaw,
            IsCognizable = violation.IsCognizable ?? false,
            TotalChallans = violation.Challans?.Count ?? 0
        };

        return ServiceResult<ViolationResponseDto>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ViolationListItemDto>>> GetAllViolationsAsync()
    {
        var violations = await _violationRepository.GetAllAsync();

        var response = violations.Select(v => new ViolationListItemDto
        {
            ViolationId = v.ViolationId,
            ViolationType = v.ViolationType ?? string.Empty,
            Description = v.Description ?? string.Empty,
            PenaltyAmount = v.PenaltyAmount ?? 0,
            IsCognizable = v.IsCognizable ?? false,
            TotalChallans = v.Challans?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<ViolationListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ViolationListItemDto>>> GetCognizableViolationsAsync()
    {
        var violations = await _violationRepository.GetCognizableViolationsAsync();

        var response = violations.Select(v => new ViolationListItemDto
        {
            ViolationId = v.ViolationId,
            ViolationType = v.ViolationType ?? string.Empty,
            Description = v.Description ?? string.Empty,
            PenaltyAmount = v.PenaltyAmount ?? 0,
            IsCognizable = v.IsCognizable ?? false,
            TotalChallans = v.Challans?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<ViolationListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<IEnumerable<ViolationListItemDto>>> SearchViolationsByTypeAsync(
        string violationType)
    {
        var violations = await _violationRepository.GetByTypeAsync(violationType);

        var response = violations.Select(v => new ViolationListItemDto
        {
            ViolationId = v.ViolationId,
            ViolationType = v.ViolationType ?? string.Empty,
            Description = v.Description ?? string.Empty,
            PenaltyAmount = v.PenaltyAmount ?? 0,
            IsCognizable = v.IsCognizable ?? false,
            TotalChallans = v.Challans?.Count ?? 0
        }).ToList();

        return ServiceResult<IEnumerable<ViolationListItemDto>>.SuccessResult(response);
    }

    public async Task<ServiceResult<ViolationResponseDto>> UpdateViolationAsync(
        UpdateViolationDto dto, int updaterUserId)
    {
        // Verify updater is Station Authority
        var updater = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == updaterUserId);

        if (updater?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<ViolationResponseDto>.FailureResult(
                "Only Station Authority users can update violations.");
        }

        // Check if violation exists
        var existingViolation = await _violationRepository.GetByIdAsync(dto.ViolationId);
        if (existingViolation == null)
        {
            return ServiceResult<ViolationResponseDto>.FailureResult(
                $"Violation with ID {dto.ViolationId} not found.");
        }

        // Check if new violation type already exists (excluding current violation)
        var typeExists = await _violationRepository
            .ViolationTypeExistsAsync(dto.ViolationType, dto.ViolationId);

        if (typeExists)
        {
            return ServiceResult<ViolationResponseDto>.FailureResult(
                $"A violation type with the name '{dto.ViolationType}' already exists.");
        }

        // Update violation
        existingViolation.ViolationType = dto.ViolationType;
        existingViolation.Description = dto.Description;
        existingViolation.PenaltyAmount = dto.PenaltyAmount;
        existingViolation.SectionOfLaw = dto.SectionOfLaw;
        existingViolation.IsCognizable = dto.IsCognizable;

        await _violationRepository.UpdateAsync(existingViolation);

        // Retrieve updated violation
        var updatedViolation = await _violationRepository.GetByIdAsync(dto.ViolationId);

        var response = new ViolationResponseDto
        {
            ViolationId = updatedViolation!.ViolationId,
            ViolationType = updatedViolation.ViolationType ?? string.Empty,
            Description = updatedViolation.Description ?? string.Empty,
            PenaltyAmount = updatedViolation.PenaltyAmount ?? 0,
            SectionOfLaw = updatedViolation.SectionOfLaw,
            IsCognizable = updatedViolation.IsCognizable ?? false,
            TotalChallans = updatedViolation.Challans?.Count ?? 0
        };

        return ServiceResult<ViolationResponseDto>.SuccessResult(
            response,
            $"Violation type '{dto.ViolationType}' updated successfully.");
    }

    public async Task<ServiceResult<string>> DeleteViolationAsync(int violationId, int deleterUserId)
    {
        // Verify deleter is Station Authority
        var deleter = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == deleterUserId);

        if (deleter?.Role?.RoleName != "Station Authority")
        {
            return ServiceResult<string>.FailureResult(
                "Only Station Authority users can delete violations.");
        }

        // Check if violation exists
        var violation = await _violationRepository.GetByIdAsync(violationId);
        if (violation == null)
        {
            return ServiceResult<string>.FailureResult(
                $"Violation with ID {violationId} not found.");
        }

        // Check if violation has challans
        var hasChallans = await _violationRepository.HasChallansAsync(violationId);
        if (hasChallans)
        {
            return ServiceResult<string>.FailureResult(
                $"Cannot delete violation '{violation.ViolationType}' because it has challans linked. " +
                $"Please remove or reassign challans first.");
        }

        var violationType = violation.ViolationType;
        var deleted = await _violationRepository.DeleteAsync(violationId);

        if (!deleted)
        {
            return ServiceResult<string>.FailureResult("Failed to delete violation.");
        }

        return ServiceResult<string>.SuccessResult(
            $"Violation type '{violationType}' deleted successfully.");
    }
}