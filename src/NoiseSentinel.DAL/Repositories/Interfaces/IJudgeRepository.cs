using NoiseSentinel.DAL.Models;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Judge entity operations.
/// </summary>
public interface IJudgeRepository
{
    Task<int> CreateAsync(Judge judge);
    Task<Judge?> GetByUserIdAsync(int userId);
}