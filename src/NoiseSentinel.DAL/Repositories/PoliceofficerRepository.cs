using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Policeofficer entity.
/// </summary>
public class PoliceofficerRepository : IPoliceofficerRepository
{
    private readonly NoiseSentinelDbContext _context;

    public PoliceofficerRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Policeofficer officer)
    {
        _context.Policeofficers.Add(officer);
        await _context.SaveChangesAsync();
        return officer.OfficerId;
    }

    public async Task<Policeofficer?> GetByUserIdAsync(int userId)
    {
        return await _context.Policeofficers
            .Include(p => p.User)
            .Include(p => p.Station)
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }
}