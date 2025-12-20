using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NoiseSentinel.DAL.Models;

namespace NoiseSentinel.DAL.Contexts;

public partial class NoiseSentinelDbContext : IdentityDbContext<User, ApplicationRole, int>
{
    public NoiseSentinelDbContext() { }

    public NoiseSentinelDbContext(DbContextOptions<NoiseSentinelDbContext> options) : base(options) { }

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
    public virtual DbSet<Role> BusinessRoles { get; set; }
    public virtual DbSet<Vehicle> Vehicles { get; set; }
    public virtual DbSet<Violation> Violations { get; set; }
    public virtual DbSet<PublicStatusOtp> PublicStatusOtps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("USER");

            // Primary key
            entity.Property(e => e.Id).HasColumnName("UserID");

            entity.Property(e => e.NormalizedEmail).HasColumnName("Email").HasMaxLength(255);
            entity.Property(e => e.NormalizedUserName).HasColumnName("Username").HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(255);

            // Your custom properties
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Email Verification Fields
            entity.Property(e => e.EmailVerificationOtp).HasMaxLength(6);
            entity.Property(e => e.OtpExpiresAt).HasColumnType("datetime");
            entity.Property(e => e.EmailVerifiedAt).HasColumnType("datetime");

            // First Login and Password Management
            entity.Property(e => e.IsFirstLogin).HasDefaultValue(true);
            entity.Property(e => e.LastPasswordChangedAt).HasColumnType("datetime");
            entity.Property(e => e.MustChangePassword).HasDefaultValue(false);

            // Unique indexes
            entity.HasIndex(e => e.NormalizedUserName).IsUnique();
            entity.HasIndex(e => e.NormalizedEmail).IsUnique();

            // Ignore non-normalized and unused Identity properties
            entity.Ignore(u => u.Email);  
            entity.Ignore(u => u.UserName);  
            entity.Ignore(u => u.PhoneNumber);
            entity.Ignore(u => u.PhoneNumberConfirmed);
            entity.Ignore(u => u.TwoFactorEnabled);
            entity.Ignore(u => u.LockoutEnd);
            entity.Ignore(u => u.LockoutEnabled);
            entity.Ignore(u => u.AccessFailedCount);
            entity.Ignore(u => u.EmailConfirmed);
            entity.Ignore(u => u.SecurityStamp);
            entity.Ignore(u => u.ConcurrencyStamp);
        });

        // Identity Tables
        modelBuilder.Entity<ApplicationRole>().ToTable("AspNetRoles");
        modelBuilder.Entity<IdentityUserRole<int>>().ToTable("AspNetUserRoles");
        modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("AspNetUserClaims");
        modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("AspNetUserLogins");
        modelBuilder.Entity<IdentityUserToken<int>>().ToTable("AspNetUserTokens");
        modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("AspNetRoleClaims");

        modelBuilder.Entity<Accused>(entity =>
        {
            entity.HasKey(e => e.AccusedId);
            entity.ToTable("ACCUSED");
        });

        modelBuilder.Entity<Case>(entity =>
        {
            entity.HasKey(e => e.CaseId);
            entity.ToTable("CASE");
            entity.HasOne(d => d.Fir).WithMany(p => p.Cases).HasForeignKey(d => d.Firid);
            entity.HasOne(d => d.Judge).WithMany(p => p.Cases).HasForeignKey(d => d.JudgeId);
        });

        modelBuilder.Entity<Casestatement>(entity =>
        {
            entity.HasKey(e => e.StatementId);
            entity.ToTable("CASESTATEMENT");
            entity.HasOne(d => d.Case).WithMany(p => p.Casestatements).HasForeignKey(d => d.CaseId);
        });

        modelBuilder.Entity<Challan>(entity =>
        {
            entity.HasKey(e => e.ChallanId);
            entity.ToTable("CHALLAN");
            entity.HasOne(d => d.Accused).WithMany(p => p.Challans).HasForeignKey(d => d.AccusedId);
            entity.HasOne(d => d.EmissionReport).WithMany(p => p.Challans).HasForeignKey(d => d.EmissionReportId);
            entity.HasOne(d => d.Officer).WithMany(p => p.Challans).HasForeignKey(d => d.OfficerId);
            entity.HasOne(d => d.Vehicle).WithMany(p => p.Challans).HasForeignKey(d => d.VehicleId);
            entity.HasOne(d => d.Violation).WithMany(p => p.Challans).HasForeignKey(d => d.ViolationId);
        });

        modelBuilder.Entity<Court>(entity =>
        {
            entity.HasKey(e => e.CourtId);
            entity.ToTable("COURT");
            entity.HasOne(d => d.CourtType).WithMany(p => p.Courts).HasForeignKey(d => d.CourtTypeId);
        });

        modelBuilder.Entity<Courttype>(entity =>
        {
            entity.HasKey(e => e.CourtTypeId);
            entity.ToTable("COURTTYPE");
        });

        modelBuilder.Entity<Emissionreport>(entity =>
        {
            entity.HasKey(e => e.EmissionReportId);
            entity.ToTable("EMISSIONREPORT");
            entity.HasOne(d => d.Device).WithMany(p => p.Emissionreports).HasForeignKey(d => d.DeviceId);
        });

        modelBuilder.Entity<Fir>(entity =>
        {
            entity.HasKey(e => e.Firid);
            entity.ToTable("FIR");
            entity.HasOne(d => d.Challan).WithMany(p => p.Firs).HasForeignKey(d => d.ChallanId);
            entity.HasOne(d => d.Informant).WithMany(p => p.Firs).HasForeignKey(d => d.InformantId);
            entity.HasOne(d => d.Station).WithMany(p => p.Firs).HasForeignKey(d => d.StationId);
        });

        modelBuilder.Entity<Iotdevice>(entity =>
        {
            entity.HasKey(e => e.DeviceId);
            entity.ToTable("IOTDEVICE");
        });

        modelBuilder.Entity<Judge>(entity =>
        {
            entity.HasKey(e => e.JudgeId);
            entity.ToTable("JUDGE");
            entity.HasOne(d => d.Court).WithMany(p => p.Judges).HasForeignKey(d => d.CourtId);
            entity.HasOne(d => d.User).WithMany(p => p.Judges).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Policeofficer>(entity =>
        {
            entity.HasKey(e => e.OfficerId);
            entity.ToTable("POLICEOFFICER");
            entity.Property(e => e.IsInvestigationOfficer).HasDefaultValue(false);
            entity.HasOne(d => d.Station).WithMany(p => p.Policeofficers).HasForeignKey(d => d.StationId);
            entity.HasOne(d => d.User).WithMany(p => p.Policeofficers).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Policestation>(entity =>
        {
            entity.HasKey(e => e.StationId);
            entity.ToTable("POLICESTATION");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId);
            entity.ToTable("ROLE");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId);
            entity.ToTable("VEHICLE");
            entity.HasOne(d => d.Owner).WithMany(p => p.Vehicles).HasForeignKey(d => d.OwnerId);
        });

        modelBuilder.Entity<Violation>(entity =>
        {
            entity.HasKey(e => e.ViolationId);
            entity.ToTable("VIOLATION");
        });

        modelBuilder.Entity<PublicStatusOtp>(entity =>
        {
            entity.HasKey(e => e.OtpId);
            entity.ToTable("PUBLIC_STATUS_OTP");
            entity.HasIndex(e => new { e.VehicleNo, e.Cnic, e.Email }).HasDatabaseName("IX_PublicStatusOtp_Search");
            entity.HasIndex(e => e.OtpCode);
            entity.HasIndex(e => e.AccessToken);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}