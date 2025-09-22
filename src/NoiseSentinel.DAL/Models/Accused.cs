using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("ACCUSED")]
public partial class Accused
{
    [Key]
    [Column("AccusedID")]
    public int AccusedId { get; set; }

    [StringLength(255)]
    public string? FullName { get; set; }

    [Column("CNIC")]
    [StringLength(20)]
    public string? Cnic { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? Province { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    [StringLength(20)]
    public string? Contact { get; set; }

    [InverseProperty("Accused")]
    public virtual ICollection<Challan> Challans { get; set; } = new List<Challan>();

    [InverseProperty("Owner")]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
