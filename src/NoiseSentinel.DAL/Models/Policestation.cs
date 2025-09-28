using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("POLICESTATION")]
public partial class Policestation
{
    [Key]
    [Column("StationID")]
    public int StationId { get; set; }

    [StringLength(255)]
    public string? StationName { get; set; }

    [StringLength(50)]
    public string? StationCode { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(255)]
    public string? District { get; set; }

    [StringLength(255)]
    public string? Province { get; set; }

    [StringLength(50)]
    public string? Contact { get; set; }

    [InverseProperty("Station")]
    public virtual ICollection<Fir> Firs { get; set; } = new List<Fir>();

    [InverseProperty("Station")]
    public virtual ICollection<Policeofficer> Policeofficers { get; set; } = new List<Policeofficer>();
}
