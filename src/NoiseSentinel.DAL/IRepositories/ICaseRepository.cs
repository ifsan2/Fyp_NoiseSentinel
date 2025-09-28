using NoiseSentinel.DAL.Models;
namespace NoiseSentinel.DAL.IRepositories
{
    public interface ICaseRepository : IGenericRepository<Case>
    {
        Task<Case?> GetCaseByCaseNumberAsync(string caseNumber);
        Task<IEnumerable<Case>> GetCasesByJudgeIdAsync(int judgeId);
        Task<Case?> GetCaseByFirIdAsync(int firId);
        Task<Case?> GetCaseWithDetailsAsync(int caseId);
    }
}