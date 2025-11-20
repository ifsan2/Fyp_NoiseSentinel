using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Accused entity.
/// </summary>
public class AccusedRepository : IAccusedRepository
{
    private readonly NoiseSentinelDbContext _context;

    public AccusedRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Accused accused)
    {
        _context.Accuseds.Add(accused);
        await _context.SaveChangesAsync();
        return accused.AccusedId;
    }

    public async Task<Accused?> GetByIdAsync(int accusedId)
    {
        return await _context.Accuseds
            .Include(a => a.Vehicles)  // Include owned vehicles
            .Include(a => a.Challans)  // Include challans/violations
            .FirstOrDefaultAsync(a => a.AccusedId == accusedId);
    }

    public async Task<Accused?> GetByCnicAsync(string cnic)
    {
        return await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Violation)
            .FirstOrDefaultAsync(a => a.Cnic != null &&
                                     a.Cnic.Replace("-", "").ToLower() == cnic.Replace("-", "").ToLower());
    }

    public async Task<IEnumerable<Accused>> GetAllAsync()
    {
        return await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Violation)
            .OrderBy(a => a.FullName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Accused>> SearchByNameAsync(string name)
    {
        return await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Violation)
            .Where(a => a.FullName != null && a.FullName.ToLower().Contains(name.ToLower()))
            .OrderBy(a => a.FullName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Accused>> GetByProvinceAsync(string province)
    {
        return await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Violation)
            .Where(a => a.Province != null && a.Province.ToLower() == province.ToLower())
            .OrderBy(a => a.FullName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Accused>> GetByCityAsync(string city)
    {
        return await _context.Accuseds
            .Include(a => a.Vehicles)
            .Include(a => a.Challans)
                .ThenInclude(c => c.Violation)
            .Where(a => a.City != null && a.City.ToLower() == city.ToLower())
            .OrderBy(a => a.FullName)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Accused accused)
    {
        _context.Accuseds.Update(accused);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAsync(int accusedId)
    {
        var accused = await _context.Accuseds.FindAsync(accusedId);
        if (accused == null)
            return false;

        _context.Accuseds.Remove(accused);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> CnicExistsAsync(string cnic, int? excludeAccusedId = null)
    {
        var normalizedCnic = cnic.Replace("-", "").ToLower();

        var query = _context.Accuseds
            .Where(a => a.Cnic != null &&
                        a.Cnic.Replace("-", "").ToLower() == normalizedCnic);

        if (excludeAccusedId.HasValue)
        {
            query = query.Where(a => a.AccusedId != excludeAccusedId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsAsync(int accusedId)
    {
        return await _context.Accuseds.AnyAsync(a => a.AccusedId == accusedId);
    }

    public async Task<int> GetViolationCountAsync(int accusedId)
    {
        return await _context.Challans
            .Where(c => c.AccusedId == accusedId)
            .CountAsync();
    }

    public async Task<int> GetVehicleCountAsync(int accusedId)
    {
        return await _context.Vehicles
            .Where(v => v.OwnerId == accusedId)
            .CountAsync();
    }
}