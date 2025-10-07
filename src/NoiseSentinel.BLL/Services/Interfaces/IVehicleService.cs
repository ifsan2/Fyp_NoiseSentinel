using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Vehicle;
using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Vehicle management operations.
/// </summary>
public interface IVehicleService
{
    /// <summary>
    /// Create a new vehicle (Police Officer, Station Authority).
    /// </summary>
    Task<ServiceResult<VehicleResponseDto>> CreateVehicleAsync(CreateVehicleDto dto, int creatorUserId);

    /// <summary>
    /// Get vehicle by ID.
    /// </summary>
    Task<ServiceResult<VehicleResponseDto>> GetVehicleByIdAsync(int vehicleId);

    /// <summary>
    /// Get vehicle by plate number.
    /// </summary>
    Task<ServiceResult<VehicleResponseDto>> GetVehicleByPlateNumberAsync(string plateNumber);

    /// <summary>
    /// Get all vehicles.
    /// </summary>
    Task<ServiceResult<IEnumerable<VehicleListItemDto>>> GetAllVehiclesAsync();

    /// <summary>
    /// Get vehicles by owner.
    /// </summary>
    Task<ServiceResult<IEnumerable<VehicleListItemDto>>> GetVehiclesByOwnerAsync(int ownerId);

    /// <summary>
    /// Search vehicles by make/model.
    /// </summary>
    Task<ServiceResult<IEnumerable<VehicleListItemDto>>> SearchVehiclesByMakeAsync(string make);

    /// <summary>
    /// Update vehicle (Station Authority only).
    /// </summary>
    Task<ServiceResult<VehicleResponseDto>> UpdateVehicleAsync(UpdateVehicleDto dto, int updaterUserId);

    /// <summary>
    /// Delete vehicle (Station Authority only).
    /// </summary>
    Task<ServiceResult<string>> DeleteVehicleAsync(int vehicleId, int deleterUserId);

    /// <summary>
    /// Get or create vehicle by plate number (used during challan creation).
    /// </summary>
    Task<ServiceResult<Vehicle>> GetOrCreateVehicleAsync(VehicleInputDto dto, int? ownerId = null);
}