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
/// Repository implementation for FIR (First Information Report) entity.
/// </summary>
public class FirRepository : IFirRepository
{
    private readonly NoiseSentinelDbContext _context;

    public FirRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Fir fir)
    {
        _context.Firs.Add(fir);
        await _context.SaveChangesAsync();
        return fir.Firid;
    }

    public async Task<Fir?> GetByIdAsync(int firId)
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
                    .ThenInclude(e => e!.Device)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Officer)
                    .ThenInclude(o => o!.User)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .FirstOrDefaultAsync(f => f.Firid == firId);
    }

    public async Task<Fir?> GetByFirNoAsync(string firNo)
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .FirstOrDefaultAsync(f => f.Firno != null && f.Firno.ToLower() == firNo.ToLower());
    }

    public async Task<IEnumerable<Fir>> GetAllAsync()
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .OrderByDescending(f => f.DateFiled)
            .ToListAsync();
    }

    public async Task<IEnumerable<Fir>> GetByStationAsync(int stationId)
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .Where(f => f.StationId == stationId)
            .OrderByDescending(f => f.DateFiled)
            .ToListAsync();
    }

    public async Task<IEnumerable<Fir>> GetByInformantAsync(int informantId)
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .Where(f => f.InformantId == informantId)
            .OrderByDescending(f => f.DateFiled)
            .ToListAsync();
    }

    public async Task<IEnumerable<Fir>> GetByStatusAsync(string status)
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .Where(f => f.Firstatus != null && f.Firstatus.ToLower() == status.ToLower())
            .OrderByDescending(f => f.DateFiled)
            .ToListAsync();
    }

    public async Task<IEnumerable<Fir>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .Where(f => f.DateFiled >= startDate && f.DateFiled <= endDate)
            .OrderByDescending(f => f.DateFiled)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Fir fir)
    {
        _context.Firs.Update(fir);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> ExistsAsync(int firId)
    {
        return await _context.Firs.AnyAsync(f => f.Firid == firId);
    }

    public async Task<bool> FirNoExistsAsync(string firNo)
    {
        return await _context.Firs.AnyAsync(f => f.Firno != null && f.Firno.ToLower() == firNo.ToLower());
    }

    public async Task<bool> ChallanHasFirAsync(int challanId)
    {
        return await _context.Firs.AnyAsync(f => f.ChallanId == challanId);
    }

    public async Task<int> GetNextFirNumberForStationAsync(int stationId, int year)
    {
        var count = await _context.Firs
            .Where(f => f.StationId == stationId &&
                       f.DateFiled != null &&
                       f.DateFiled.Value.Year == year)
            .CountAsync();

        return count + 1;
    }

    public async Task<IEnumerable<Fir>> SearchFirsAsync(
        string? firNo = null,
        int? challanId = null,
        string? vehiclePlateNumber = null,
        string? accusedCnic = null,
        string? accusedName = null,
        string? firStatus = null,
        int? stationId = null,
        DateTime? dateFiledFrom = null,
        DateTime? dateFiledTo = null,
        bool? hasCase = null)
    {
        var query = _context.Firs
            .Include(f => f.Station)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Accused)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Vehicle)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Violation)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.Officer)
                    .ThenInclude(o => o!.User)
            .Include(f => f.Challan)
                .ThenInclude(c => c!.EmissionReport)
            .Include(f => f.Informant)
                .ThenInclude(i => i!.User)
            .Include(f => f.Cases)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(firNo))
        {
            query = query.Where(f => f.Firno != null && f.Firno.Contains(firNo));
        }

        if (challanId.HasValue)
        {
            query = query.Where(f => f.ChallanId == challanId.Value);
        }

        if (!string.IsNullOrWhiteSpace(vehiclePlateNumber))
        {
            query = query.Where(f => f.Challan != null && 
                f.Challan.Vehicle != null && 
                f.Challan.Vehicle.PlateNumber == vehiclePlateNumber);
        }

        if (!string.IsNullOrWhiteSpace(accusedCnic))
        {
            query = query.Where(f => f.Challan != null && 
                f.Challan.Accused != null && 
                f.Challan.Accused.Cnic == accusedCnic);
        }

        if (!string.IsNullOrWhiteSpace(accusedName))
        {
            query = query.Where(f => f.Challan != null && 
                f.Challan.Accused != null && 
                f.Challan.Accused.FullName != null &&
                f.Challan.Accused.FullName.Contains(accusedName));
        }

        if (!string.IsNullOrWhiteSpace(firStatus))
        {
            query = query.Where(f => f.Firstatus != null && f.Firstatus == firStatus);
        }

        if (stationId.HasValue)
        {
            query = query.Where(f => f.StationId == stationId.Value);
        }

        if (dateFiledFrom.HasValue)
        {
            query = query.Where(f => f.DateFiled >= dateFiledFrom.Value);
        }

        if (dateFiledTo.HasValue)
        {
            query = query.Where(f => f.DateFiled <= dateFiledTo.Value);
        }

        if (hasCase.HasValue)
        {
            if (hasCase.Value)
            {
                query = query.Where(f => f.Cases.Any());
            }
            else
            {
                query = query.Where(f => !f.Cases.Any());
            }
        }

        return await query.OrderByDescending(f => f.DateFiled).ToListAsync();
    }
}