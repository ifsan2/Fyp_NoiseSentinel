using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("JUDGE")]
public partial class Judge
{
    [Key]
    [Column("JudgeID")]
    public int JudgeId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("CourtID")]
    public int? CourtId { get; set; }

    [Column("CNIC")]
    [StringLength(20)]
    public string? Cnic { get; set; }

    [StringLength(20)]
    public string? ContactNo { get; set; }

    [StringLength(100)]
    public string? Rank { get; set; }

    public bool? ServiceStatus { get; set; }

    [InverseProperty("Judge")]
    public virtual ICollection<Case> Cases { get; set; } = new List<Case>();

    [ForeignKey("CourtId")]
    [InverseProperty("Judges")]
    public virtual Court? Court { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Judges")]
    public virtual User? User { get; set; }
}
