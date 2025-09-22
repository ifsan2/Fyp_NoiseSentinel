using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("CASESTATEMENT")]
public partial class Casestatement
{
    [Key]
    [Column("StatementID")]
    public int StatementId { get; set; }

    [Column("CaseID")]
    public int? CaseId { get; set; }

    [StringLength(255)]
    public string? StatementBy { get; set; }

    public string? StatementText { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? StatementDate { get; set; }

    [ForeignKey("CaseId")]
    [InverseProperty("Casestatements")]
    public virtual Case? Case { get; set; }
}
