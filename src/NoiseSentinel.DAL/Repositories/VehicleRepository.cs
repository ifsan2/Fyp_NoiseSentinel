using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Vehicle entity.
/// </summary>
public class VehicleRepository : IVehicleRepository
{
    private readonly NoiseSentinelDbContext _context;

    public VehicleRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle.VehicleId;
    }

    public async Task<Vehicle?> GetByIdAsync(int vehicleId)
    {
        return await _context.Vehicles
            .Include(v => v.Owner)  // Include owner details
            .Include(v => v.Challans)  // Include challans for violation history
            .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);
    }

    public async Task<Vehicle?> GetByPlateNumberAsync(string plateNumber)
    {
        return await _context.Vehicles
            .Include(v => v.Owner)
            .Include(v => v.Challans)
            .FirstOrDefaultAsync(v => v.PlateNumber != null &&
                                     v.PlateNumber.ToLower() == plateNumber.ToLower());
    }

    public async Task<IEnumerable<Vehicle>> GetAllAsync()
    {
        return await _context.Vehicles
            .Include(v => v.Owner)
            .Include(v => v.Challans)
                .ThenInclude(c => c.Violation)
            .OrderBy(v => v.PlateNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Vehicle>> GetByOwnerAsync(int ownerId)
    {
        return await _context.Vehicles
            .Include(v => v.Owner)
            .Include(v => v.Challans)
                .ThenInclude(c => c.Violation)
            .Where(v => v.OwnerId == ownerId)
            .OrderBy(v => v.PlateNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Vehicle>> SearchByMakeAsync(string make)
    {
        return await _context.Vehicles
            .Include(v => v.Owner)
            .Include(v => v.Challans)
                .ThenInclude(c => c.Violation)
            .Where(v => v.Make != null && v.Make.ToLower().Contains(make.ToLower()))
            .OrderBy(v => v.PlateNumber)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Vehicle vehicle)
    {
        _context.Vehicles.Update(vehicle);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAsync(int vehicleId)
    {
        var vehicle = await _context.Vehicles.FindAsync(vehicleId);
        if (vehicle == null)
            return false;

        _context.Vehicles.Remove(vehicle);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> PlateNumberExistsAsync(string plateNumber, int? excludeVehicleId = null)
    {
        var query = _context.Vehicles
            .Where(v => v.PlateNumber != null &&
                        v.PlateNumber.ToLower() == plateNumber.ToLower());

        if (excludeVehicleId.HasValue)
        {
            query = query.Where(v => v.VehicleId != excludeVehicleId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsAsync(int vehicleId)
    {
        return await _context.Vehicles.AnyAsync(v => v.VehicleId == vehicleId);
    }

    public async Task<int> GetViolationCountAsync(int vehicleId)
    {
        return await _context.Challans
            .Where(c => c.VehicleId == vehicleId)
            .CountAsync();
    }
}