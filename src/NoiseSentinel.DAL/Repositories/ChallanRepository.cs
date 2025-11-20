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
/// Repository implementation for Challan entity.
/// </summary>
public class ChallanRepository : IChallanRepository
{
    private readonly NoiseSentinelDbContext _context;

    public ChallanRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Challan challan)
    {
        _context.Challans.Add(challan);
        await _context.SaveChangesAsync();
        return challan.ChallanId;
    }

    public async Task<Challan?> GetByIdAsync(int challanId)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
                .ThenInclude(e => e!.Device)
            .FirstOrDefaultAsync(c => c.ChallanId == challanId);
    }

    public async Task<IEnumerable<Challan>> GetAllAsync()
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetByOfficerAsync(int officerId)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.OfficerId == officerId)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetByStationAsync(int stationId)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.Officer!.StationId == stationId)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetByVehicleAsync(int vehicleId)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.VehicleId == vehicleId)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetByAccusedAsync(int accusedId)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.AccusedId == accusedId)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetByStatusAsync(string status)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.Status != null && c.Status.ToLower() == status.ToLower())
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.IssueDateTime >= startDate && c.IssueDateTime <= endDate)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Challan>> GetOverdueChallansAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Officer)
                .ThenInclude(o => o!.Station)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.DueDateTime < now &&
                       c.Status != null &&
                       c.Status.ToLower() == "unpaid")
            .OrderBy(c => c.DueDateTime)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(int challanId)
    {
        return await _context.Challans.AnyAsync(c => c.ChallanId == challanId);
    }

    public async Task<bool> EmissionReportHasChallanAsync(int emissionReportId)
    {
        return await _context.Challans.AnyAsync(c => c.EmissionReportId == emissionReportId);
    }

    public async Task<IEnumerable<Challan>> GetByVehiclePlateAndCnicAsync(string plateNumber, string cnic)
    {
        return await _context.Challans
            .Include(c => c.Officer)
                .ThenInclude(o => o!.User)
            .Include(c => c.Accused)
            .Include(c => c.Vehicle)
            .Include(c => c.Violation)
            .Include(c => c.EmissionReport)
            .Where(c => c.Vehicle!.PlateNumber == plateNumber && c.Accused!.Cnic == cnic)
            .OrderByDescending(c => c.IssueDateTime)
            .ToListAsync();
    }
}