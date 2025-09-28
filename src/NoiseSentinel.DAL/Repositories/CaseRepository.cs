using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Repositories
{
    public class CaseRepository : GenericRepository<Case>, ICaseRepository
    {
        public CaseRepository(NoiseSentinelDbContext context) : base(context)
        {
        }

        public async Task<Case?> GetCaseByCaseNumberAsync(string caseNumber)
        {
            return await _context.Cases
                .FirstOrDefaultAsync(c => c.CaseNo == caseNumber);
        }

        public async Task<IEnumerable<Case>> GetCasesByJudgeIdAsync(int judgeId)
        {
            return await _context.Cases
                .Where(c => c.JudgeId == judgeId)
                .OrderByDescending(c => c.HearingDate)
                .ToListAsync();
        }

        public async Task<Case?> GetCaseByFirIdAsync(int firId)
        {
            return await _context.Cases
                .FirstOrDefaultAsync(c => c.Firid == firId);
        }

        public async Task<Case?> GetCaseWithDetailsAsync(int caseId)
        {
            return await _context.Cases
                .Include(c => c.Fir)
                .Include(c => c.Judge)
                .Include(c => c.Casestatements)
                .FirstOrDefaultAsync(c => c.CaseId == caseId);
        }
    }
}