using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Challan;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Challan management operations.
/// </summary>
public interface IChallanService
{
    /// <summary>
    /// Create a new challan (Police Officer only).
    /// Auto-creates Vehicle and Accused if they don't exist.
    /// </summary>
    Task<ServiceResult<ChallanResponseDto>> CreateChallanAsync(CreateChallanDto dto, int officerUserId);

    /// <summary>
    /// Get challan by ID.
    /// </summary>
    Task<ServiceResult<ChallanResponseDto>> GetChallanByIdAsync(int challanId);

    /// <summary>
    /// Get challans by officer (own challans).
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByOfficerAsync(int officerId);

    /// <summary>
    /// Get all challans (Station Authority).
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetAllChallansAsync();

    /// <summary>
    /// Get challans by station.
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByStationAsync(int stationId);

    /// <summary>
    /// Get challans by vehicle.
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByVehicleAsync(int vehicleId);

    /// <summary>
    /// Get challans by accused.
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByAccusedAsync(int accusedId);

    /// <summary>
    /// Get challans by status (Unpaid, Paid, Disputed).
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByStatusAsync(string status);

    /// <summary>
    /// Get challans by date range.
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetChallansByDateRangeAsync(
        DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get overdue challans (past due date and unpaid).
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> GetOverdueChallansAsync();

    /// <summary>
    /// Public search: Get challans by vehicle plate number and accused CNIC.
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> SearchChallansByPlateAndCnicAsync(string plateNumber, string cnic);

    /// <summary>
    /// Advanced search: Search challans by multiple criteria (Station Authority only).
    /// </summary>
    Task<ServiceResult<IEnumerable<ChallanListItemDto>>> SearchChallansAsync(ChallanSearchDto searchDto);
}