using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("FIR")]
public partial class Fir
{
    [Key]
    [Column("FIRID")]
    public int Firid { get; set; }

    [Column("FIRNo")]
    [StringLength(50)]
    public string? Firno { get; set; }

    [Column("StationID")]
    public int? StationId { get; set; }

    [Column("ChallanID")]
    public int? ChallanId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DateFiled { get; set; }

    [Column("FIRDescription")]
    [StringLength(500)]
    public string? Firdescription { get; set; }

    [Column("FIRStatus")]
    [StringLength(100)]
    public string? Firstatus { get; set; }

    [Column("InformantID")]
    public int? InformantId { get; set; }

    [StringLength(500)]
    public string? InvestigationReport { get; set; }

    [InverseProperty("Fir")]
    public virtual ICollection<Case> Cases { get; set; } = new List<Case>();

    [ForeignKey("ChallanId")]
    [InverseProperty("Firs")]
    public virtual Challan? Challan { get; set; }

    [ForeignKey("InformantId")]
    [InverseProperty("Firs")]
    public virtual Policeofficer? Informant { get; set; }

    [ForeignKey("StationId")]
    [InverseProperty("Firs")]
    public virtual Policestation? Station { get; set; }
}
