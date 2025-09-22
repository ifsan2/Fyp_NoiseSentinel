using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("EMISSIONREPORT")]
public partial class Emissionreport
{
    [Key]
    [Column("EmissionReportID")]
    public int EmissionReportId { get; set; }

    [Column("DeviceID")]
    public int? DeviceId { get; set; }

    [Column("CO", TypeName = "decimal(10, 2)")]
    public decimal? Co { get; set; }

    [Column("CO2", TypeName = "decimal(10, 2)")]
    public decimal? Co2 { get; set; }

    [Column("HC", TypeName = "decimal(10, 2)")]
    public decimal? Hc { get; set; }

    [Column("NOx", TypeName = "decimal(10, 2)")]
    public decimal? Nox { get; set; }

    [Column("SoundLevel_dBA", TypeName = "decimal(10, 2)")]
    public decimal? SoundLevelDBa { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? TestDateTime { get; set; }

    [Column("Ml_Classification")]
    [StringLength(255)]
    public string? MlClassification { get; set; }

    [StringLength(255)]
    public string? DigitalSignatureValue { get; set; }

    [InverseProperty("EmissionReport")]
    public virtual ICollection<Challan> Challans { get; set; } = new List<Challan>();

    [ForeignKey("DeviceId")]
    [InverseProperty("Emissionreports")]
    public virtual Iotdevice? Device { get; set; }
}
