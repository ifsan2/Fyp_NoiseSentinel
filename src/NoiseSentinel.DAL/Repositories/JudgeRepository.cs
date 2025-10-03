using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Judge entity.
/// </summary>
public class JudgeRepository : IJudgeRepository
{
    private readonly NoiseSentinelDbContext _context;

    public JudgeRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Judge judge)
    {
        _context.Judges.Add(judge);
        await _context.SaveChangesAsync();
        return judge.JudgeId;
    }

    public async Task<Judge?> GetByUserIdAsync(int userId)
    {
        return await _context.Judges
            .Include(j => j.User)
            .Include(j => j.Court)
            .FirstOrDefaultAsync(j => j.UserId == userId);
    }
}