using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NoiseSentinel.DAL.Models;

[Table("IOTDEVICE")]
public partial class Iotdevice
{
    [Key]
    [Column("DeviceID")]
    public int DeviceId { get; set; }

    [StringLength(255)]
    public string? DeviceName { get; set; }

    [StringLength(100)]
    public string? FirmwareVersion { get; set; }

    public bool? IsCalibrated { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PairingDateTime { get; set; }

    public bool? IsRegistered { get; set; }

    [InverseProperty("Device")]
    public virtual ICollection<Emissionreport> Emissionreports { get; set; } = new List<Emissionreport>();
}
