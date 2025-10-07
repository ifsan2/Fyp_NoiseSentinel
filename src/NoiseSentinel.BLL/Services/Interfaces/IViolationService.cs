using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Violation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Violation management operations.
/// </summary>
public interface IViolationService
{
    /// <summary>
    /// Create a new violation type (Station Authority only).
    /// </summary>
    Task<ServiceResult<ViolationResponseDto>> CreateViolationAsync(CreateViolationDto dto, int creatorUserId);

    /// <summary>
    /// Get violation by ID.
    /// </summary>
    Task<ServiceResult<ViolationResponseDto>> GetViolationByIdAsync(int violationId);

    /// <summary>
    /// Get all violations.
    /// </summary>
    Task<ServiceResult<IEnumerable<ViolationListItemDto>>> GetAllViolationsAsync();

    /// <summary>
    /// Get cognizable violations (for FIR workflow).
    /// </summary>
    Task<ServiceResult<IEnumerable<ViolationListItemDto>>> GetCognizableViolationsAsync();

    /// <summary>
    /// Search violations by type.
    /// </summary>
    Task<ServiceResult<IEnumerable<ViolationListItemDto>>> SearchViolationsByTypeAsync(string violationType);

    /// <summary>
    /// Update violation (Station Authority only).
    /// </summary>
    Task<ServiceResult<ViolationResponseDto>> UpdateViolationAsync(UpdateViolationDto dto, int updaterUserId);

    /// <summary>
    /// Delete violation (Station Authority only).
    /// </summary>
    Task<ServiceResult<string>> DeleteViolationAsync(int violationId, int deleterUserId);
}