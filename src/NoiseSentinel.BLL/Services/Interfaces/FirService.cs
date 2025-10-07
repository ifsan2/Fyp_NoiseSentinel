using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Fir;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for FIR management operations.
/// </summary>
public interface IFirService
{
    /// <summary>
    /// Create a new FIR (Station Authority only).
    /// </summary>
    Task<ServiceResult<FirResponseDto>> CreateFirAsync(CreateFirDto dto, int creatorUserId);

    /// <summary>
    /// Get FIR by ID.
    /// </summary>
    Task<ServiceResult<FirResponseDto>> GetFirByIdAsync(int firId);

    /// <summary>
    /// Get FIR by FIR number.
    /// </summary>
    Task<ServiceResult<FirResponseDto>> GetFirByFirNoAsync(string firNo);

    /// <summary>
    /// Get all FIRs.
    /// </summary>
    Task<ServiceResult<IEnumerable<FirListItemDto>>> GetAllFirsAsync();

    /// <summary>
    /// Get FIRs by station.
    /// </summary>
    Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByStationAsync(int stationId);

    /// <summary>
    /// Get FIRs by informant (police officer).
    /// </summary>
    Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByInformantAsync(int informantId);

    /// <summary>
    /// Get FIRs by status.
    /// </summary>
    Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByStatusAsync(string status);

    /// <summary>
    /// Get FIRs by date range.
    /// </summary>
    Task<ServiceResult<IEnumerable<FirListItemDto>>> GetFirsByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get cognizable challans eligible for FIR (without FIR yet).
    /// </summary>
    Task<ServiceResult<IEnumerable<CognizableChallanDto>>> GetCognizableChallansAsync();

    /// <summary>
    /// Update FIR status and investigation report (Station Authority only).
    /// </summary>
    Task<ServiceResult<FirResponseDto>> UpdateFirAsync(UpdateFirDto dto, int updaterUserId);
}