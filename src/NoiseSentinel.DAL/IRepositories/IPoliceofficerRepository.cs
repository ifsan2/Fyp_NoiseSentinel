using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.IRepositories
{
    public interface IPoliceofficerRepository : IGenericRepository<Policeofficer>
    {
        Task<Policeofficer?> GetOfficerByBadgeNumberAsync(string badgeNumber);
        Task<IEnumerable<Policeofficer>> GetOfficersByStationIdAsync(int stationId);
        Task<Policeofficer?> GetOfficerWithDetailsAsync(int officerId);
    }
}