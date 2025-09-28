using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.IRepositories;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories;

namespace NoiseSentinel.DAL.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly NoiseSentinelDbContext _context;

        // Specific Repositories
        public IChallanRepository Challans { get; private set; }
        public IAccusedRepository Accuseds { get; private set; }
        public IVehicleRepository Vehicles { get; private set; }
        public IPoliceofficerRepository PoliceOfficers { get; private set; }
        public IFirRepository FIRs { get; private set; }
        public ICaseRepository Cases { get; private set; }

        // Generic Repositories
        public IGenericRepository<Emissionreport> EmissionReports { get; private set; }
        public IGenericRepository<Violation> Violations { get; private set; }
        public IGenericRepository<User> Users { get; private set; }
        public IGenericRepository<Role> Roles { get; private set; }
        public IGenericRepository<Policestation> PoliceStations { get; private set; }
        public IGenericRepository<Judge> Judges { get; private set; }
        public IGenericRepository<Court> Courts { get; private set; }
        public IGenericRepository<Courttype> CourtTypes { get; private set; }
        public IGenericRepository<Iotdevice> IoTDevices { get; private set; }
        public IGenericRepository<Casestatement> CaseStatements { get; private set; }

        public UnitOfWork(NoiseSentinelDbContext context)
        {
            _context = context;

            // Initialize all specific repositories
            Challans = new ChallanRepository(_context);
            Accuseds = new AccusedRepository(_context);
            Vehicles = new VehicleRepository(_context);
            PoliceOfficers = new PoliceofficerRepository(_context);
            FIRs = new FirRepository(_context);
            Cases = new CaseRepository(_context);

            // Initialize all generic repositories
            EmissionReports = new GenericRepository<Emissionreport>(_context);
            Violations = new GenericRepository<Violation>(_context);
            Users = new GenericRepository<User>(_context);
            Roles = new GenericRepository<Role>(_context);
            PoliceStations = new GenericRepository<Policestation>(_context);
            Judges = new GenericRepository<Judge>(_context);
            Courts = new GenericRepository<Court>(_context);
            CourtTypes = new GenericRepository<Courttype>(_context);
            IoTDevices = new GenericRepository<Iotdevice>(_context);
            CaseStatements = new GenericRepository<Casestatement>(_context);
        }

        // Commits all the changes to the database in a single transaction.
        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        // Disposes the database context when the Unit of Work is disposed.
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}

