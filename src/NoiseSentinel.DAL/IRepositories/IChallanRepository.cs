using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.IRepositories
{
    public interface IChallanRepository : IGenericRepository<Challan>
    {
        Task<IEnumerable<Challan>> GetChallansByOfficerIdAsync(int officerId);
        Task<Challan?> GetChallanWithDetailsAsync(int challanId);
    }
}
