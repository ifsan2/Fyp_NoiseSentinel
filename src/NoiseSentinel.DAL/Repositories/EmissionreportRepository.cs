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
/// Repository implementation for Emissionreport entity.
/// </summary>
public class EmissionreportRepository : IEmissionreportRepository
{
    private readonly NoiseSentinelDbContext _context;

    public EmissionreportRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Emissionreport emissionReport)
    {
        _context.Emissionreports.Add(emissionReport);
        await _context.SaveChangesAsync();
        return emissionReport.EmissionReportId;
    }

    public async Task<Emissionreport?> GetByIdAsync(int emissionReportId)
    {
        return await _context.Emissionreports
            .Include(e => e.Device)  // Include IoT device details
            .Include(e => e.Challans)  // Include linked challans
            .FirstOrDefaultAsync(e => e.EmissionReportId == emissionReportId);
    }

    public async Task<IEnumerable<Emissionreport>> GetAllAsync()
    {
        return await _context.Emissionreports
            .Include(e => e.Device)
            .Include(e => e.Challans)
            .OrderByDescending(e => e.TestDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Emissionreport>> GetByDeviceAsync(int deviceId)
    {
        return await _context.Emissionreports
            .Include(e => e.Device)
            .Include(e => e.Challans)
            .Where(e => e.DeviceId == deviceId)
            .OrderByDescending(e => e.TestDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Emissionreport>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Emissionreports
            .Include(e => e.Device)
            .Include(e => e.Challans)
            .Where(e => e.TestDateTime >= startDate && e.TestDateTime <= endDate)
            .OrderByDescending(e => e.TestDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Emissionreport>> GetViolationReportsAsync(decimal soundThreshold = 85.0m)
    {
        return await _context.Emissionreports
            .Include(e => e.Device)
            .Include(e => e.Challans)
            .Where(e => e.SoundLevelDBa != null && e.SoundLevelDBa > soundThreshold)
            .OrderByDescending(e => e.SoundLevelDBa)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(int emissionReportId)
    {
        return await _context.Emissionreports
            .AnyAsync(e => e.EmissionReportId == emissionReportId);
    }

    public async Task<bool> CheckDuplicateReadingAsync(int deviceId, DateTime testDateTime, int withinMinutes = 5)
    {
        var startTime = testDateTime.AddMinutes(-withinMinutes);
        var endTime = testDateTime.AddMinutes(withinMinutes);

        return await _context.Emissionreports
            .AnyAsync(e => e.DeviceId == deviceId &&
                          e.TestDateTime >= startTime &&
                          e.TestDateTime <= endTime);
    }

    public async Task<IEnumerable<Emissionreport>> GetReportsWithoutChallansAsync()
    {
        return await _context.Emissionreports
            .Include(e => e.Device)
            .Where(e => !e.Challans.Any())
            .OrderByDescending(e => e.TestDateTime)
            .ToListAsync();
    }
}