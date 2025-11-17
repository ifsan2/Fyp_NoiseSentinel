using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Challan entity operations.
/// </summary>
public interface IChallanRepository
{
    /// <summary>
    /// Create a new challan (immutable after creation).
    /// </summary>
    Task<int> CreateAsync(Challan challan);

    /// <summary>
    /// Get challan by ID with all navigation properties.
    /// </summary>
    Task<Challan?> GetByIdAsync(int challanId);

    /// <summary>
    /// Get all challans.
    /// </summary>
    Task<IEnumerable<Challan>> GetAllAsync();

    /// <summary>
    /// Get challans by officer (who issued them).
    /// </summary>
    Task<IEnumerable<Challan>> GetByOfficerAsync(int officerId);

    /// <summary>
    /// Get challans by station.
    /// </summary>
    Task<IEnumerable<Challan>> GetByStationAsync(int stationId);

    /// <summary>
    /// Get challans by vehicle.
    /// </summary>
    Task<IEnumerable<Challan>> GetByVehicleAsync(int vehicleId);

    /// <summary>
    /// Get challans by accused.
    /// </summary>
    Task<IEnumerable<Challan>> GetByAccusedAsync(int accusedId);

    /// <summary>
    /// Get challans by status (Unpaid, Paid, Disputed).
    /// </summary>
    Task<IEnumerable<Challan>> GetByStatusAsync(string status);

    /// <summary>
    /// Get challans by date range.
    /// </summary>
    Task<IEnumerable<Challan>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Get overdue challans (past due date and unpaid).
    /// </summary>
    Task<IEnumerable<Challan>> GetOverdueChallansAsync();

    /// <summary>
    /// Check if challan exists.
    /// </summary>
    Task<bool> ExistsAsync(int challanId);

    /// <summary>
    /// Check if emission report already has a challan.
    /// </summary>
    Task<bool> EmissionReportHasChallanAsync(int emissionReportId);

    /// <summary>
    /// Get challans by vehicle plate number and accused CNIC (public search).
    /// </summary>
    Task<IEnumerable<Challan>> GetByVehiclePlateAndCnicAsync(string plateNumber, string cnic);
}