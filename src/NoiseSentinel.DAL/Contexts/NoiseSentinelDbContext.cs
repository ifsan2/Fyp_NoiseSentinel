using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Contexts;

public partial class NoiseSentinelDbContext : DbContext
{
    public NoiseSentinelDbContext()
    {
    }

    public NoiseSentinelDbContext(DbContextOptions<NoiseSentinelDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Accused> Accuseds { get; set; }

    public virtual DbSet<Case> Cases { get; set; }

    public virtual DbSet<Casestatement> Casestatements { get; set; }

    public virtual DbSet<Challan> Challans { get; set; }

    public virtual DbSet<Court> Courts { get; set; }

    public virtual DbSet<Courttype> Courttypes { get; set; }

    public virtual DbSet<Emissionreport> Emissionreports { get; set; }

    public virtual DbSet<Fir> Firs { get; set; }

    public virtual DbSet<Iotdevice> Iotdevices { get; set; }

    public virtual DbSet<Judge> Judges { get; set; }

    public virtual DbSet<Policeofficer> Policeofficers { get; set; }

    public virtual DbSet<Policestation> Policestations { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<Violation> Violations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Accused>(entity =>
        {
            entity.HasKey(e => e.AccusedId).HasName("PK__ACCUSED__CE9C5E50CE978097");
        });

        modelBuilder.Entity<Case>(entity =>
        {
            entity.HasKey(e => e.CaseId).HasName("PK__CASE__6CAE526CE59878F9");

            entity.HasOne(d => d.Fir).WithMany(p => p.Cases).HasConstraintName("FK__CASE__FIRID__0D7A0286");

            entity.HasOne(d => d.Judge).WithMany(p => p.Cases).HasConstraintName("FK__CASE__JudgeID__0E6E26BF");
        });

        modelBuilder.Entity<Casestatement>(entity =>
        {
            entity.HasKey(e => e.StatementId).HasName("PK__CASESTAT__2B7E042264AA0223");

            entity.HasOne(d => d.Case).WithMany(p => p.Casestatements).HasConstraintName("FK__CASESTATE__CaseI__0F624AF8");
        });

        modelBuilder.Entity<Challan>(entity =>
        {
            entity.HasKey(e => e.ChallanId).HasName("PK__CHALLAN__BFB043C42BD778F3");

            entity.HasOne(d => d.Accused).WithMany(p => p.Challans).HasConstraintName("FK__CHALLAN__Accused__04E4BC85");

            entity.HasOne(d => d.EmissionReport).WithMany(p => p.Challans).HasConstraintName("FK__CHALLAN__Emissio__07C12930");

            entity.HasOne(d => d.Officer).WithMany(p => p.Challans).HasConstraintName("FK__CHALLAN__Officer__03F0984C");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.Challans).HasConstraintName("FK__CHALLAN__Vehicle__05D8E0BE");

            entity.HasOne(d => d.Violation).WithMany(p => p.Challans).HasConstraintName("FK__CHALLAN__Violati__06CD04F7");
        });

        modelBuilder.Entity<Court>(entity =>
        {
            entity.HasKey(e => e.CourtId).HasName("PK__COURT__C3A67CFA7CCA74AA");

            entity.HasOne(d => d.CourtType).WithMany(p => p.Courts).HasConstraintName("FK__COURT__CourtType__10566F31");
        });

        modelBuilder.Entity<Courttype>(entity =>
        {
            entity.HasKey(e => e.CourtTypeId).HasName("PK__COURTTYP__FF339CD576BECD70");
        });

        modelBuilder.Entity<Emissionreport>(entity =>
        {
            entity.HasKey(e => e.EmissionReportId).HasName("PK__EMISSION__8E3661695FEBB894");

            entity.HasOne(d => d.Device).WithMany(p => p.Emissionreports).HasConstraintName("FK__EMISSIONR__Devic__09A971A2");
        });

        modelBuilder.Entity<Fir>(entity =>
        {
            entity.HasKey(e => e.Firid).HasName("PK__FIR__66D37DC241B7B359");

            entity.HasOne(d => d.Challan).WithMany(p => p.Firs).HasConstraintName("FK__FIR__ChallanID__0B91BA14");

            entity.HasOne(d => d.Informant).WithMany(p => p.Firs).HasConstraintName("FK__FIR__InformantID__0C85DE4D");

            entity.HasOne(d => d.Station).WithMany(p => p.Firs).HasConstraintName("FK__FIR__StationID__0A9D95DB");
        });

        modelBuilder.Entity<Iotdevice>(entity =>
        {
            entity.HasKey(e => e.DeviceId).HasName("PK__IOTDEVIC__49E1233121A1B811");
        });

        modelBuilder.Entity<Judge>(entity =>
        {
            entity.HasKey(e => e.JudgeId).HasName("PK__JUDGE__66ACA95D22B812CF");

            entity.HasOne(d => d.Court).WithMany(p => p.Judges).HasConstraintName("FK__JUDGE__CourtID__02FC7413");

            entity.HasOne(d => d.User).WithMany(p => p.Judges).HasConstraintName("FK__JUDGE__UserID__02084FDA");
        });

        modelBuilder.Entity<Policeofficer>(entity =>
        {
            entity.HasKey(e => e.OfficerId).HasName("PK__POLICEOF__2E65579A44259891");

            entity.Property(e => e.IsInvestigationOfficer).HasDefaultValue(false);

            entity.HasOne(d => d.Station).WithMany(p => p.Policeofficers).HasConstraintName("FK__POLICEOFF__Stati__01142BA1");

            entity.HasOne(d => d.User).WithMany(p => p.Policeofficers).HasConstraintName("FK__POLICEOFF__UserI__00200768");
        });

        modelBuilder.Entity<Policestation>(entity =>
        {
            entity.HasKey(e => e.StationId).HasName("PK__POLICEST__E0D8A6DD9B4351D3");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__ROLE__8AFACE3AECFC9FD3");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__USER__1788CCACDF0627E9");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__USER__RoleID__7F2BE32F");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId).HasName("PK__VEHICLE__476B54B214EEECC5");

            entity.HasOne(d => d.Owner).WithMany(p => p.Vehicles).HasConstraintName("FK__VEHICLE__OwnerID__08B54D69");
        });

        modelBuilder.Entity<Violation>(entity =>
        {
            entity.HasKey(e => e.ViolationId).HasName("PK__VIOLATIO__18B6DC28B83C9A07");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
