using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories;
using System;
using System.Threading.Tasks;

namespace NoiseSentinel.DAL
{
    // The Unit of Work interface defines a contract for managing all repositories
    // and committing all changes to the database in a single transaction.
    public interface IUnitOfWork : IDisposable
    {
        // Specific Repositories
        IChallanRepository Challans { get; }
        IAccusedRepository Accuseds { get; }
        IVehicleRepository Vehicles { get; }
        IPoliceofficerRepository PoliceOfficers { get; }
        IFirRepository FIRs { get; }
        ICaseRepository Cases { get; }

        // Generic Repositories for other entities
        IGenericRepository<Emissionreport> EmissionReports { get; }
        IGenericRepository<Violation> Violations { get; }
        IGenericRepository<User> Users { get; }
        IGenericRepository<Role> Roles { get; }
        IGenericRepository<Policestation> PoliceStations { get; }
        IGenericRepository<Judge> Judges { get; }
        IGenericRepository<Court> Courts { get; }
        IGenericRepository<Courttype> CourtTypes { get; }
        IGenericRepository<Iotdevice> IoTDevices { get; }
        IGenericRepository<Casestatement> CaseStatements { get; }

        // The method that will save all changes made within this unit of work.
        Task<int> CompleteAsync();
    }
}

