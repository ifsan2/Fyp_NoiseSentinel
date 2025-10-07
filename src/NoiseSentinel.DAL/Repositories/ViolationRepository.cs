using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Violation entity.
/// </summary>
public class ViolationRepository : IViolationRepository
{
    private readonly NoiseSentinelDbContext _context;

    public ViolationRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Violation violation)
    {
        _context.Violations.Add(violation);
        await _context.SaveChangesAsync();
        return violation.ViolationId;
    }

    public async Task<Violation?> GetByIdAsync(int violationId)
    {
        return await _context.Violations
            .Include(v => v.Challans)  // Include related challans for count
            .FirstOrDefaultAsync(v => v.ViolationId == violationId);
    }

    public async Task<IEnumerable<Violation>> GetAllAsync()
    {
        return await _context.Violations
            .Include(v => v.Challans)  // Include for challan count
            .OrderBy(v => v.ViolationType)
            .ToListAsync();
    }

    public async Task<IEnumerable<Violation>> GetCognizableViolationsAsync()
    {
        return await _context.Violations
            .Include(v => v.Challans)
            .Where(v => v.IsCognizable == true)
            .OrderBy(v => v.ViolationType)
            .ToListAsync();
    }

    public async Task<IEnumerable<Violation>> GetByTypeAsync(string violationType)
    {
        return await _context.Violations
            .Include(v => v.Challans)
            .Where(v => v.ViolationType != null &&
                        v.ViolationType.ToLower().Contains(violationType.ToLower()))
            .OrderBy(v => v.ViolationType)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Violation violation)
    {
        _context.Violations.Update(violation);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAsync(int violationId)
    {
        var violation = await _context.Violations.FindAsync(violationId);
        if (violation == null)
            return false;

        _context.Violations.Remove(violation);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> ViolationTypeExistsAsync(string violationType, int? excludeViolationId = null)
    {
        var query = _context.Violations
            .Where(v => v.ViolationType != null &&
                        v.ViolationType.ToLower() == violationType.ToLower());

        if (excludeViolationId.HasValue)
        {
            query = query.Where(v => v.ViolationId != excludeViolationId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsAsync(int violationId)
    {
        return await _context.Violations.AnyAsync(v => v.ViolationId == violationId);
    }

    public async Task<bool> HasChallansAsync(int violationId)
    {
        return await _context.Challans.AnyAsync(c => c.ViolationId == violationId);
    }
}