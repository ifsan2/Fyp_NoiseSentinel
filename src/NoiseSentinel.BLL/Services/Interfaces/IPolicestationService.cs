using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Policestation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Police Station management operations.
/// </summary>
public interface IPolicestationService
{
    /// <summary>
    /// Create a new police station (Station Authority only).
    /// </summary>
    Task<ServiceResult<PolicestationResponseDto>> CreatePolicestationAsync(CreatePolicestationDto dto, int creatorUserId);

    /// <summary>
    /// Get police station by ID.
    /// </summary>
    Task<ServiceResult<PolicestationResponseDto>> GetPolicestationByIdAsync(int stationId);

    /// <summary>
    /// Get all police stations.
    /// </summary>
    Task<ServiceResult<IEnumerable<PolicestationListItemDto>>> GetAllPolicestationsAsync();

    /// <summary>
    /// Get police stations by province.
    /// </summary>
    Task<ServiceResult<IEnumerable<PolicestationListItemDto>>> GetPolicestationsByProvinceAsync(string province);

    /// <summary>
    /// Get police station by station code.
    /// </summary>
    Task<ServiceResult<PolicestationResponseDto>> GetPolicestationByCodeAsync(string stationCode);

    /// <summary>
    /// Update police station (Station Authority only).
    /// </summary>
    Task<ServiceResult<PolicestationResponseDto>> UpdatePolicestationAsync(UpdatePolicestationDto dto, int updaterUserId);

    /// <summary>
    /// Delete police station (Admin only).
    /// </summary>
    Task<ServiceResult<string>> DeletePolicestationAsync(int stationId, int deleterUserId);
}