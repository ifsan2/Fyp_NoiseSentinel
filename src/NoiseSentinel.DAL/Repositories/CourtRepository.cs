using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Court entity.
/// </summary>
public class CourtRepository : ICourtRepository
{
    private readonly NoiseSentinelDbContext _context;

    public CourtRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Court court)
    {
        _context.Courts.Add(court);
        await _context.SaveChangesAsync();
        return court.CourtId;
    }

    public async Task<Court?> GetByIdAsync(int courtId)
    {
        return await _context.Courts
            .Include(c => c.CourtType)
            .Include(c => c.Judges)
                .ThenInclude(j => j.User)
            .FirstOrDefaultAsync(c => c.CourtId == courtId);
    }

    public async Task<IEnumerable<Court>> GetAllAsync()
    {
        return await _context.Courts
            .Include(c => c.CourtType)
            .OrderBy(c => c.CourtName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Court>> GetByTypeAsync(int courtTypeId)
    {
        return await _context.Courts
            .Include(c => c.CourtType)
            .Where(c => c.CourtTypeId == courtTypeId)
            .OrderBy(c => c.CourtName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Court>> GetByProvinceAsync(string province)
    {
        return await _context.Courts
            .Include(c => c.CourtType)
            .Where(c => c.Province == province)
            .OrderBy(c => c.CourtName)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Court court)
    {
        _context.Courts.Update(court);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAsync(int courtId)
    {
        var court = await _context.Courts.FindAsync(courtId);
        if (court == null)
            return false;

        _context.Courts.Remove(court);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> CourtNameExistsAsync(string courtName, string province, int? excludeCourtId = null)
    {
        var query = _context.Courts
            .Where(c => c.CourtName == courtName && c.Province == province);

        if (excludeCourtId.HasValue)
        {
            query = query.Where(c => c.CourtId != excludeCourtId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsAsync(int courtId)
    {
        return await _context.Courts.AnyAsync(c => c.CourtId == courtId);
    }
}