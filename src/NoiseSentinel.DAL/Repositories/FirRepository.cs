using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Repositories
{
    public class FirRepository : GenericRepository<Fir>, IFirRepository
    {
        public FirRepository(NoiseSentinelDbContext context) : base(context)
        {
        }

        public async Task<Fir?> GetFirByFirNumberAsync(string firNumber)
        {
            return await _context.Firs
                .FirstOrDefaultAsync(f => f.Firno == firNumber);
        }

        public async Task<IEnumerable<Fir>> GetFirsByStationIdAsync(int stationId)
        {
            return await _context.Firs
                .Where(f => f.StationId == stationId)
                .OrderByDescending(f => f.DateFiled)
                .ToListAsync();
        }

        public async Task<Fir?> GetFirByChallanIdAsync(int challanId)
        {
            return await _context.Firs
                .FirstOrDefaultAsync(f => f.ChallanId == challanId);
        }

        public async Task<Fir?> GetFirWithDetailsAsync(int firId)
        {
            return await _context.Firs
                .Include(f => f.Station) // Eager load the related PoliceStation
                .Include(f => f.Challan) // Eager load the related Challan
                .FirstOrDefaultAsync(f => f.Firid == firId);
        }
    }
}