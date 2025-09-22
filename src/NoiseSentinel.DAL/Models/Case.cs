using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("CASE")]
public partial class Case
{
    [Key]
    [Column("CaseID")]
    public int CaseId { get; set; }

    [Column("FIRID")]
    public int? Firid { get; set; }

    [Column("JudgeID")]
    public int? JudgeId { get; set; }

    [StringLength(50)]
    public string? CaseNo { get; set; }

    [StringLength(255)]
    public string? CaseType { get; set; }

    [StringLength(100)]
    public string? CaseStatus { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? HearingDate { get; set; }

    [StringLength(255)]
    public string? Verdict { get; set; }

    [InverseProperty("Case")]
    public virtual ICollection<Casestatement> Casestatements { get; set; } = new List<Casestatement>();

    [ForeignKey("Firid")]
    [InverseProperty("Cases")]
    public virtual Fir? Fir { get; set; }

    [ForeignKey("JudgeId")]
    [InverseProperty("Cases")]
    public virtual Judge? Judge { get; set; }
}
