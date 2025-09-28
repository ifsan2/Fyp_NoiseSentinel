using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Repositories
{
    public class VehicleRepository : GenericRepository<Vehicle>, IVehicleRepository
    {
        public VehicleRepository(NoiseSentinelDbContext context) : base(context)
        {
        }

        public async Task<Vehicle?> GetVehicleByPlateNumberAsync(string plateNumber)
        {
            return await _context.Vehicles
                .FirstOrDefaultAsync(v => v.PlateNumber == plateNumber);
        }

        public async Task<Vehicle?> GetVehicleByChasisNumberAsync(string chasisNumber)
        {
            return await _context.Vehicles
                .FirstOrDefaultAsync(v => v.ChasisNo == chasisNumber);
        }

        public async Task<IEnumerable<Vehicle>> GetVehiclesByOwnerIdAsync(int ownerId)
        {
            return await _context.Vehicles
                .Where(v => v.OwnerId == ownerId)
                .ToListAsync();
        }
    }
}