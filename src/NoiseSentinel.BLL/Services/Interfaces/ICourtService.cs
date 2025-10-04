using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Court;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Court management operations.
/// </summary>
public interface ICourtService
{
    /// <summary>
    /// Create a new court (Court Authority only).
    /// </summary>
    Task<ServiceResult<CourtResponseDto>> CreateCourtAsync(CreateCourtDto dto, int creatorUserId);

    /// <summary>
    /// Get court by ID.
    /// </summary>
    Task<ServiceResult<CourtResponseDto>> GetCourtByIdAsync(int courtId);

    /// <summary>
    /// Get all courts.
    /// </summary>
    Task<ServiceResult<IEnumerable<CourtListItemDto>>> GetAllCourtsAsync();

    /// <summary>
    /// Get courts by type.
    /// </summary>
    Task<ServiceResult<IEnumerable<CourtListItemDto>>> GetCourtsByTypeAsync(int courtTypeId);

    /// <summary>
    /// Get courts by province.
    /// </summary>
    Task<ServiceResult<IEnumerable<CourtListItemDto>>> GetCourtsByProvinceAsync(string province);

    /// <summary>
    /// Update court (Court Authority only).
    /// </summary>
    Task<ServiceResult<CourtResponseDto>> UpdateCourtAsync(UpdateCourtDto dto, int updaterUserId);

    /// <summary>
    /// Delete court (Admin only).
    /// </summary>
    Task<ServiceResult<string>> DeleteCourtAsync(int courtId, int deleterUserId);

    /// <summary>
    /// Get all court types.
    /// </summary>
    Task<ServiceResult<IEnumerable<CourttypeResponseDto>>> GetCourtTypesAsync();

    /// <summary>
    /// Initialize court types (Supreme, High, Civil).
    /// </summary>
    Task InitializeCourtTypesAsync();
}