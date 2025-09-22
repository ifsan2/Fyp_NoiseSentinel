using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("CHALLAN")]
public partial class Challan
{
    [Key]
    [Column("ChallanID")]
    public int ChallanId { get; set; }

    [Column("OfficerID")]
    public int? OfficerId { get; set; }

    [Column("AccusedID")]
    public int? AccusedId { get; set; }

    [Column("VehicleID")]
    public int? VehicleId { get; set; }

    [Column("ViolationID")]
    public int? ViolationId { get; set; }

    [Column("EmissionReportID")]
    public int? EmissionReportId { get; set; }

    [StringLength(255)]
    public string? EvidencePath { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? IssueDateTime { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DueDateTime { get; set; }

    [StringLength(100)]
    public string? Status { get; set; }

    [StringLength(255)]
    public string? BankDetails { get; set; }

    [StringLength(255)]
    public string? DigitalSignatureValue { get; set; }

    [ForeignKey("AccusedId")]
    [InverseProperty("Challans")]
    public virtual Accused? Accused { get; set; }

    [ForeignKey("EmissionReportId")]
    [InverseProperty("Challans")]
    public virtual Emissionreport? EmissionReport { get; set; }

    [InverseProperty("Challan")]
    public virtual ICollection<Fir> Firs { get; set; } = new List<Fir>();

    [ForeignKey("OfficerId")]
    [InverseProperty("Challans")]
    public virtual Policeofficer? Officer { get; set; }

    [ForeignKey("VehicleId")]
    [InverseProperty("Challans")]
    public virtual Vehicle? Vehicle { get; set; }

    [ForeignKey("ViolationId")]
    [InverseProperty("Challans")]
    public virtual Violation? Violation { get; set; }
}
