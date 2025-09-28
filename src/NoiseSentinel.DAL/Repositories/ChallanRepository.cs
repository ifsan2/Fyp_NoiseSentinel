using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Repositories
{
    public class ChallanRepository : GenericRepository<Challan>, IChallanRepository
    {
        public ChallanRepository(NoiseSentinelDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Challan>> GetChallansByOfficerIdAsync(int officerId)
        {
            return await _context.Challans
                .Where(c => c.OfficerId == officerId)
                .OrderByDescending(c => c.IssueDateTime)
                .ToListAsync();
        }

        public async Task<Challan?> GetChallanWithDetailsAsync(int challanId)
        {
            // Use .Include() to load related data (eager loading)
            // from different tables in a single query.
            return await _context.Challans
                .Include(c => c.Officer)
                .Include(c => c.Accused)
                .Include(c => c.Vehicle)
                .Include(c => c.Violation)
                .Include(c => c.EmissionReport)
                .FirstOrDefaultAsync(c => c.ChallanId == challanId);
        }
    }
}