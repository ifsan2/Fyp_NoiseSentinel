using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.IRepositories
{
    public interface IAccusedRepository : IGenericRepository<Accused>
    {
        Task<Accused?> GetAccusedByCnicAsync(string cnic);
    }
}