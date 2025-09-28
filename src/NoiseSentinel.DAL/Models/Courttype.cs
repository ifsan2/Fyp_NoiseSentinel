using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("COURTTYPE")]
public partial class Courttype
{
    [Key]
    [Column("CourtTypeID")]
    public int CourtTypeId { get; set; }

    [StringLength(255)]
    public string? CourtTypeName { get; set; }

    [InverseProperty("CourtType")]
    public virtual ICollection<Court> Courts { get; set; } = new List<Court>();
}
