using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Policestation entity.
/// </summary>
public class PolicestationRepository : IPolicestationRepository
{
    private readonly NoiseSentinelDbContext _context;

    public PolicestationRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Policestation station)
    {
        _context.Policestations.Add(station);
        await _context.SaveChangesAsync();
        return station.StationId;
    }

    public async Task<Policestation?> GetByIdAsync(int stationId)
    {
        return await _context.Policestations
            .Include(s => s.Policeofficers)
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(s => s.StationId == stationId);
    }

    public async Task<IEnumerable<Policestation>> GetAllAsync()
    {
        return await _context.Policestations
            .Include(s => s.Policeofficers)  // ✅ FIXED: Added this line
            .OrderBy(s => s.StationName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Policestation>> GetByProvinceAsync(string province)
    {
        return await _context.Policestations
            .Include(s => s.Policeofficers)  // ✅ FIXED: Added this line
            .Where(s => s.Province == province)
            .OrderBy(s => s.StationName)
            .ToListAsync();
    }

    public async Task<Policestation?> GetByStationCodeAsync(string stationCode)
    {
        return await _context.Policestations
            .Include(s => s.Policeofficers)  // ✅ FIXED: Added this line
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(s => s.StationCode == stationCode);
    }

    public async Task<bool> UpdateAsync(Policestation station)
    {
        _context.Policestations.Update(station);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAsync(int stationId)
    {
        var station = await _context.Policestations.FindAsync(stationId);
        if (station == null)
            return false;

        _context.Policestations.Remove(station);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> StationNameExistsAsync(string stationName, string province, int? excludeStationId = null)
    {
        var query = _context.Policestations
            .Where(s => s.StationName == stationName && s.Province == province);

        if (excludeStationId.HasValue)
        {
            query = query.Where(s => s.StationId != excludeStationId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> StationCodeExistsAsync(string stationCode, int? excludeStationId = null)
    {
        var query = _context.Policestations
            .Where(s => s.StationCode == stationCode);

        if (excludeStationId.HasValue)
        {
            query = query.Where(s => s.StationId != excludeStationId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsAsync(int stationId)
    {
        return await _context.Policestations.AnyAsync(s => s.StationId == stationId);
    }
}