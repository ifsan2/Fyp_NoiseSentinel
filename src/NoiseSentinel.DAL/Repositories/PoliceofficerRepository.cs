using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Repositories
{
    public class PoliceofficerRepository : GenericRepository<Policeofficer>, IPoliceofficerRepository
    {
        public PoliceofficerRepository(NoiseSentinelDbContext context) : base(context)
        {
        }

        public async Task<Policeofficer?> GetOfficerByBadgeNumberAsync(string badgeNumber)
        {
            return await _context.Policeofficers
                .FirstOrDefaultAsync(p => p.BadgeNumber == badgeNumber);
        }

        public async Task<IEnumerable<Policeofficer>> GetOfficersByStationIdAsync(int stationId)
        {
            return await _context.Policeofficers
                .Where(p => p.StationId == stationId)
                .ToListAsync();
        }

        public async Task<Policeofficer?> GetOfficerWithDetailsAsync(int officerId)
        {
            // Eager load the related User and PoliceStation entities
            return await _context.Policeofficers
                .Include(p => p.User)
                .Include(p => p.Station)
                .FirstOrDefaultAsync(p => p.OfficerId == officerId);
        }
    }
}