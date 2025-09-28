using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Repositories
{
    public class AccusedRepository : GenericRepository<Accused>, IAccusedRepository
    {
        public AccusedRepository(NoiseSentinelDbContext context) : base(context)
        {
        }

        public async Task<Accused?> GetAccusedByCnicAsync(string cnic)
        {
            return await _context.Accuseds
                .FirstOrDefaultAsync(a => a.Cnic == cnic);
        }
    }
}