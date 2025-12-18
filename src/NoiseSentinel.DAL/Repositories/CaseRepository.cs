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
/// Repository implementation for Case entity.
/// </summary>
public class CaseRepository : ICaseRepository
{
    private readonly NoiseSentinelDbContext _context;

    public CaseRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Case caseEntity)
    {
        _context.Cases.Add(caseEntity);
        await _context.SaveChangesAsync();
        return caseEntity.CaseId;
    }

    public async Task<Case?> GetByIdAsync(int caseId)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Station)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Accused)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Vehicle)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Violation)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.EmissionReport)
                        .ThenInclude(e => e!.Device)
            .Include(c => c.Casestatements)
            .FirstOrDefaultAsync(c => c.CaseId == caseId);
    }

    public async Task<Case?> GetByCaseNoAsync(string caseNo)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
            .Include(c => c.Casestatements)
            .FirstOrDefaultAsync(c => c.CaseNo != null && c.CaseNo.ToLower() == caseNo.ToLower());
    }

    public async Task<IEnumerable<Case>> GetAllAsync()
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Accused)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Vehicle)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Violation)
            .Include(c => c.Casestatements)
            .OrderByDescending(c => c.CaseId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Case>> GetByJudgeAsync(int judgeId)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Accused)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Vehicle)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Violation)
            .Include(c => c.Casestatements)
            .Where(c => c.JudgeId == judgeId)
            .OrderByDescending(c => c.HearingDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Case>> GetByCourtAsync(int courtId)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Accused)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Vehicle)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Violation)
            .Include(c => c.Casestatements)
            .Where(c => c.Judge!.CourtId == courtId)
            .OrderByDescending(c => c.HearingDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Case>> GetByStatusAsync(string status)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Accused)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Vehicle)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Violation)
            .Include(c => c.Casestatements)
            .Where(c => c.CaseStatus != null && c.CaseStatus.ToLower() == status.ToLower())
            .OrderByDescending(c => c.HearingDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Case>> GetByCaseTypeAsync(string caseType)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
            .Include(c => c.Casestatements)
            .Where(c => c.CaseType != null && c.CaseType.ToLower() == caseType.ToLower())
            .OrderByDescending(c => c.HearingDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Case>> GetByHearingDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Cases
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
            .Include(c => c.Casestatements)
            .Where(c => c.HearingDate >= startDate && c.HearingDate <= endDate)
            .OrderBy(c => c.HearingDate)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Case caseEntity)
    {
        _context.Cases.Update(caseEntity);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> ExistsAsync(int caseId)
    {
        return await _context.Cases.AnyAsync(c => c.CaseId == caseId);
    }

    public async Task<bool> CaseNoExistsAsync(string caseNo)
    {
        return await _context.Cases.AnyAsync(c => c.CaseNo != null && c.CaseNo.ToLower() == caseNo.ToLower());
    }

    public async Task<bool> FirHasCaseAsync(int firId)
    {
        return await _context.Cases.AnyAsync(c => c.Firid == firId);
    }

    public async Task<int> GetNextCaseNumberForCourtAsync(int courtId, int year)
    {
        // Get count of cases for this court in this year
        var count = await _context.Cases
            .Include(c => c.Judge)
            .Where(c => c.Judge!.CourtId == courtId &&
                       c.CaseId > 0) // Assuming cases exist
            .CountAsync();

        // Filter by year if we have a creation date field
        // For now, simple increment
        return count + 1;
    }

    public async Task<IEnumerable<Case>> SearchCasesAsync(
        string? caseNo = null,
        string? firNo = null,
        string? vehiclePlateNumber = null,
        string? accusedCnic = null,
        string? accusedName = null,
        string? caseStatus = null,
        string? caseType = null,
        int? judgeId = null,
        DateTime? hearingDateFrom = null,
        DateTime? hearingDateTo = null)
    {
        var query = _context.Cases
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Vehicle)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Accused)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Challan)
                    .ThenInclude(ch => ch!.Violation)
            .Include(c => c.Fir)
                .ThenInclude(f => f!.Station)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.User)
            .Include(c => c.Judge)
                .ThenInclude(j => j!.Court)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(caseNo))
        {
            query = query.Where(c => c.CaseNo != null && c.CaseNo.Contains(caseNo));
        }

        if (!string.IsNullOrWhiteSpace(firNo))
        {
            query = query.Where(c => c.Fir != null && c.Fir.Firno != null && c.Fir.Firno.Contains(firNo));
        }

        if (!string.IsNullOrWhiteSpace(vehiclePlateNumber))
        {
            query = query.Where(c => c.Fir != null && c.Fir.Challan != null && 
                c.Fir.Challan.Vehicle != null && 
                c.Fir.Challan.Vehicle.PlateNumber == vehiclePlateNumber);
        }

        if (!string.IsNullOrWhiteSpace(accusedCnic))
        {
            query = query.Where(c => c.Fir != null && c.Fir.Challan != null && 
                c.Fir.Challan.Accused != null && 
                c.Fir.Challan.Accused.Cnic == accusedCnic);
        }

        if (!string.IsNullOrWhiteSpace(accusedName))
        {
            query = query.Where(c => c.Fir != null && c.Fir.Challan != null && 
                c.Fir.Challan.Accused != null && 
                c.Fir.Challan.Accused.FullName != null &&
                c.Fir.Challan.Accused.FullName.Contains(accusedName));
        }

        if (!string.IsNullOrWhiteSpace(caseStatus))
        {
            query = query.Where(c => c.CaseStatus != null && c.CaseStatus == caseStatus);
        }

        if (!string.IsNullOrWhiteSpace(caseType))
        {
            query = query.Where(c => c.CaseType != null && c.CaseType == caseType);
        }

        if (judgeId.HasValue)
        {
            query = query.Where(c => c.JudgeId == judgeId.Value);
        }

        if (hearingDateFrom.HasValue)
        {
            query = query.Where(c => c.HearingDate >= hearingDateFrom.Value);
        }

        if (hearingDateTo.HasValue)
        {
            query = query.Where(c => c.HearingDate <= hearingDateTo.Value);
        }

        return await query.OrderByDescending(c => c.HearingDate).ToListAsync();
    }
}