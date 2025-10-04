using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Courttype entity.
/// </summary>
public class CourttypeRepository : ICourttypeRepository
{
    private readonly NoiseSentinelDbContext _context;

    public CourttypeRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<Courttype?> GetByIdAsync(int courtTypeId)
    {
        return await _context.Courttypes.FindAsync(courtTypeId);
    }

    public async Task<Courttype?> GetByNameAsync(string courtTypeName)
    {
        return await _context.Courttypes
            .FirstOrDefaultAsync(ct => ct.CourtTypeName == courtTypeName);
    }

    public async Task<IEnumerable<Courttype>> GetAllAsync()
    {
        return await _context.Courttypes
            .OrderBy(ct => ct.CourtTypeName)
            .ToListAsync();
    }

    public async Task<int> CreateAsync(Courttype courtType)
    {
        _context.Courttypes.Add(courtType);
        await _context.SaveChangesAsync();
        return courtType.CourtTypeId;
    }

    public async Task<bool> ExistsAsync(int courtTypeId)
    {
        return await _context.Courttypes
            .AnyAsync(ct => ct.CourtTypeId == courtTypeId);
    }
}