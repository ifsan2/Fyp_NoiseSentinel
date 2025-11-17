using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("POLICEOFFICER")]
public partial class Policeofficer
{
    [Key]
    [Column("OfficerID")]
    public int OfficerId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("StationID")]
    public int? StationId { get; set; }

    [Column("CNIC")]
    [StringLength(20)]
    public string? Cnic { get; set; }

    [StringLength(20)]
    public string? ContactNo { get; set; }

    [StringLength(50)]
    public string? BadgeNumber { get; set; }

    [StringLength(100)]
    public string? Rank { get; set; }

    public bool? IsInvestigationOfficer { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PostingDate { get; set; }

    [InverseProperty("Officer")]
    public virtual ICollection<Challan> Challans { get; set; } = new List<Challan>();

    [InverseProperty("Informant")]
    public virtual ICollection<Fir> Firs { get; set; } = new List<Fir>();

    [InverseProperty("PairedOfficer")]
    public virtual ICollection<Iotdevice> Iotdevices { get; set; } = new List<Iotdevice>();

    [ForeignKey("StationId")]
    [InverseProperty("Policeofficers")]
    public virtual Policestation? Station { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Policeofficers")]
    public virtual User? User { get; set; }
}
