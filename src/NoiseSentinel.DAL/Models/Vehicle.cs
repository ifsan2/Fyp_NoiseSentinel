using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("VEHICLE")]
public partial class Vehicle
{
    [Key]
    [Column("VehicleID")]
    public int VehicleId { get; set; }

    [Column("Veh_Reg_Year", TypeName = "datetime")]
    public DateTime? VehRegYear { get; set; }

    [StringLength(50)]
    public string? PlateNumber { get; set; }

    [StringLength(100)]
    public string? Make { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    [StringLength(100)]
    public string? ChasisNo { get; set; }

    [StringLength(100)]
    public string? EngineNo { get; set; }

    [Column("OwnerID")]
    public int? OwnerId { get; set; }

    [InverseProperty("Vehicle")]
    public virtual ICollection<Challan> Challans { get; set; } = new List<Challan>();

    [ForeignKey("OwnerId")]
    [InverseProperty("Vehicles")]
    public virtual Accused? Owner { get; set; }
}
