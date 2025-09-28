using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.IRepositories
{
    public interface IVehicleRepository : IGenericRepository<Vehicle>
    {
        Task<Vehicle?> GetVehicleByPlateNumberAsync(string plateNumber);
        Task<Vehicle?> GetVehicleByChasisNumberAsync(string chasisNumber);
        Task<IEnumerable<Vehicle>> GetVehiclesByOwnerIdAsync(int ownerId);
    }
}