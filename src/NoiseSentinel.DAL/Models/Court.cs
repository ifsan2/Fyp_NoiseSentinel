using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("COURT")]
public partial class Court
{
    [Key]
    [Column("CourtID")]
    public int CourtId { get; set; }

    [StringLength(255)]
    public string? CourtName { get; set; }

    [Column("CourtTypeID")]
    public int? CourtTypeId { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(255)]
    public string? District { get; set; }

    [StringLength(255)]
    public string? Province { get; set; }

    [ForeignKey("CourtTypeId")]
    [InverseProperty("Courts")]
    public virtual Courttype? CourtType { get; set; }

    [InverseProperty("Court")]
    public virtual ICollection<Judge> Judges { get; set; } = new List<Judge>();
}
