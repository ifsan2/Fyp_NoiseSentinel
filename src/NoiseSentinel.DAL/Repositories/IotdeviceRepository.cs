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
/// Repository implementation for Iotdevice entity.
/// </summary>
public class IotdeviceRepository : IIotdeviceRepository
{
    private readonly NoiseSentinelDbContext _context;

    public IotdeviceRepository(NoiseSentinelDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(Iotdevice device)
    {
        _context.Iotdevices.Add(device);
        await _context.SaveChangesAsync();
        return device.DeviceId;
    }

    public async Task<Iotdevice?> GetByIdAsync(int deviceId)
    {
        return await _context.Iotdevices
            .Include(d => d.Emissionreports)  // Include emission reports for usage stats
            .FirstOrDefaultAsync(d => d.DeviceId == deviceId);
    }

    public async Task<Iotdevice?> GetByNameAsync(string deviceName)
    {
        return await _context.Iotdevices
            .Include(d => d.Emissionreports)
            .FirstOrDefaultAsync(d => d.DeviceName != null &&
                                     d.DeviceName.ToLower() == deviceName.ToLower());
    }

    public async Task<IEnumerable<Iotdevice>> GetAllAsync()
    {
        return await _context.Iotdevices
            .Include(d => d.Emissionreports)
            .OrderBy(d => d.DeviceName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Iotdevice>> GetAvailableDevicesAsync()
    {
        return await _context.Iotdevices
            .Where(d => d.IsRegistered == true && d.IsCalibrated == true)
            .OrderBy(d => d.DeviceName)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(Iotdevice device)
    {
        _context.Iotdevices.Update(device);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> UpdatePairingDateTimeAsync(int deviceId, DateTime pairingDateTime)
    {
        var device = await _context.Iotdevices.FindAsync(deviceId);
        if (device == null)
            return false;

        device.PairingDateTime = pairingDateTime;
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> DeviceNameExistsAsync(string deviceName, int? excludeDeviceId = null)
    {
        var query = _context.Iotdevices
            .Where(d => d.DeviceName != null &&
                        d.DeviceName.ToLower() == deviceName.ToLower());

        if (excludeDeviceId.HasValue)
        {
            query = query.Where(d => d.DeviceId != excludeDeviceId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsAsync(int deviceId)
    {
        return await _context.Iotdevices.AnyAsync(d => d.DeviceId == deviceId);
    }

    public async Task<int> GetDeviceUsageCountAsync(int deviceId)
    {
        return await _context.Emissionreports
            .Where(e => e.DeviceId == deviceId)
            .CountAsync();
    }
}