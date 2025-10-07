using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Accused;
using NoiseSentinel.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for Accused management operations.
/// </summary>
public interface IAccusedService
{
    /// <summary>
    /// Create a new accused person (Police Officer, Station Authority).
    /// </summary>
    Task<ServiceResult<AccusedResponseDto>> CreateAccusedAsync(CreateAccusedDto dto, int creatorUserId);

    /// <summary>
    /// Get accused by ID.
    /// </summary>
    Task<ServiceResult<AccusedResponseDto>> GetAccusedByIdAsync(int accusedId);

    /// <summary>
    /// Get accused by CNIC.
    /// </summary>
    Task<ServiceResult<AccusedResponseDto>> GetAccusedByCnicAsync(string cnic);

    /// <summary>
    /// Get all accused persons.
    /// </summary>
    Task<ServiceResult<IEnumerable<AccusedListItemDto>>> GetAllAccusedAsync();

    /// <summary>
    /// Search accused by name.
    /// </summary>
    Task<ServiceResult<IEnumerable<AccusedListItemDto>>> SearchAccusedByNameAsync(string name);

    /// <summary>
    /// Get accused by province.
    /// </summary>
    Task<ServiceResult<IEnumerable<AccusedListItemDto>>> GetAccusedByProvinceAsync(string province);

    /// <summary>
    /// Get accused by city.
    /// </summary>
    Task<ServiceResult<IEnumerable<AccusedListItemDto>>> GetAccusedByCityAsync(string city);

    /// <summary>
    /// Update accused (Station Authority only).
    /// </summary>
    Task<ServiceResult<AccusedResponseDto>> UpdateAccusedAsync(UpdateAccusedDto dto, int updaterUserId);

    /// <summary>
    /// Delete accused (Station Authority only).
    /// </summary>
    Task<ServiceResult<string>> DeleteAccusedAsync(int accusedId, int deleterUserId);

    /// <summary>
    /// Get or create accused by CNIC (used during challan creation).
    /// </summary>
    Task<ServiceResult<Accused>> GetOrCreateAccusedAsync(AccusedInputDto dto);
}