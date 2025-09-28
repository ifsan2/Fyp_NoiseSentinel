using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.IRepositories
{
    public interface IFirRepository : IGenericRepository<Fir>
    {
        Task<Fir?> GetFirByFirNumberAsync(string firNumber);
        Task<IEnumerable<Fir>> GetFirsByStationIdAsync(int stationId);
        Task<Fir?> GetFirByChallanIdAsync(int challanId);
        Task<Fir?> GetFirWithDetailsAsync(int firId);
    }
}