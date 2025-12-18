using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories;

/// <summary>
/// Repository implementation for Casestatement entity.
/// </summary>
public class CasestatementRepository : ICasestatementRepository
{
    private readonly NoiseSentinelDbContext _context;

    public CasestatementRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Casestatement casestatement)
    {
        _context.Casestatements.Add(casestatement);
        await _context.SaveChangesAsync();
        return casestatement.StatementId;
    }

    public async Task<Casestatement?> GetByIdAsync(int statementId)
    {
        return await _context.Casestatements
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.User)
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.Court)
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Fir)
                    .ThenInclude(f => f!.Challan)
                        .ThenInclude(ch => ch!.Accused)
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Fir)
                    .ThenInclude(f => f!.Challan)
                        .ThenInclude(ch => ch!.Vehicle)
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Fir)
                    .ThenInclude(f => f!.Challan)
                        .ThenInclude(ch => ch!.Violation)
            .FirstOrDefaultAsync(cs => cs.StatementId == statementId);
    }

    public async Task<IEnumerable<Casestatement>> GetByCaseAsync(int caseId)
    {
        return await _context.Casestatements
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.User)
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.Court)
            .Where(cs => cs.CaseId == caseId)
            .OrderByDescending(cs => cs.StatementDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Casestatement>> GetAllAsync()
    {
        return await _context.Casestatements
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.User)
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.Court)
            .OrderByDescending(cs => cs.StatementDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Casestatement>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Casestatements
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.User)
            .Where(cs => cs.StatementDate >= startDate && cs.StatementDate <= endDate)
            .OrderByDescending(cs => cs.StatementDate)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Casestatement casestatement)
    {
        _context.Casestatements.Update(casestatement);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAsync(int statementId)
    {
        var casestatement = await _context.Casestatements.FindAsync(statementId);
        if (casestatement == null)
            return false;

        _context.Casestatements.Remove(casestatement);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> ExistsAsync(int statementId)
    {
        return await _context.Casestatements.AnyAsync(cs => cs.StatementId == statementId);
    }

    public async Task<Casestatement?> GetLatestStatementForCaseAsync(int caseId)
    {
        return await _context.Casestatements
            .Include(cs => cs.Case)
                .ThenInclude(c => c!.Judge)
                    .ThenInclude(j => j!.User)
            .Where(cs => cs.CaseId == caseId)
            .OrderByDescending(cs => cs.StatementDate)
            .FirstOrDefaultAsync();
    }
}