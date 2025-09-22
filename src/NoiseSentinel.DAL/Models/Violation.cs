using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("VIOLATION")]
public partial class Violation
{
    [Key]
    [Column("ViolationID")]
    public int ViolationId { get; set; }

    [StringLength(255)]
    public string? ViolationType { get; set; }

    [StringLength(255)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? PenaltyAmount { get; set; }

    [StringLength(255)]
    public string? SectionOfLaw { get; set; }

    public bool? IsCognizable { get; set; }

    [InverseProperty("Violation")]
    public virtual ICollection<Challan> Challans { get; set; } = new List<Challan>();
}
