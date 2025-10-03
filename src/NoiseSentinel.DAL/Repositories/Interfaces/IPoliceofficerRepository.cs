using NoiseSentinel.DAL.Models;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.Repositories.Interfaces;

/// <summary>
/// Repository interface for Policeofficer entity operations.
/// </summary>
public interface IPoliceofficerRepository
{
    Task<int> CreateAsync(Policeofficer officer);
    Task<Policeofficer?> GetByUserIdAsync(int userId);
}