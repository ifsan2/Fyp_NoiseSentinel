using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Vehicle entity operations.
/// </summary>
public interface IVehicleRepository
{
    /// <summary>
    /// Create a new vehicle.
    /// </summary>
    Task<int> CreateAsync(Vehicle vehicle);

    /// <summary>
    /// Get vehicle by ID with navigation properties.
    /// </summary>
    Task<Vehicle?> GetByIdAsync(int vehicleId);

    /// <summary>
    /// Get vehicle by plate number (unique identifier).
    /// </summary>
    Task<Vehicle?> GetByPlateNumberAsync(string plateNumber);

    /// <summary>
    /// Get all vehicles.
    /// </summary>
    Task<IEnumerable<Vehicle>> GetAllAsync();

    /// <summary>
    /// Get vehicles by owner (accused).
    /// </summary>
    Task<IEnumerable<Vehicle>> GetByOwnerAsync(int ownerId);

    /// <summary>
    /// Search vehicles by make/model.
    /// </summary>
    Task<IEnumerable<Vehicle>> SearchByMakeAsync(string make);

    /// <summary>
    /// Update an existing vehicle.
    /// </summary>
    Task<bool> UpdateAsync(Vehicle vehicle);

    /// <summary>
    /// Delete a vehicle.
    /// </summary>
    Task<bool> DeleteAsync(int vehicleId);

    /// <summary>
    /// Check if plate number already exists (case-insensitive).
    /// </summary>
    Task<bool> PlateNumberExistsAsync(string plateNumber, int? excludeVehicleId = null);

    /// <summary>
    /// Check if vehicle exists.
    /// </summary>
    Task<bool> ExistsAsync(int vehicleId);

    /// <summary>
    /// Get vehicle violation count (total challans).
    /// </summary>
    Task<int> GetViolationCountAsync(int vehicleId);
}