using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL.IRepositories
{
    public interface IGenericRepository<T> where T : class
    {
        // Get an entity by its primary key
        Task<T> GetByIdAsync(int id);

        // Get all entities
        Task<IEnumerable<T>> GetAllAsync();

        // Add a new entity
        Task AddAsync(T entity);

        // Mark an entity as modified
        void Update(T entity);

        // Mark an entity for deletion
        void Delete(T entity);
    
    }
}
