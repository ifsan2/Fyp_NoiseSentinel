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

    [Column(TypeName = "datetime")]
    public DateTime? CalibrationDate { get; set; }

    public bool? CalibrationStatus { get; set; }

    [StringLength(255)]
    public string? CalibrationCertificateNo { get; set; }

    public bool? IsActive { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PairingDateTime { get; set; }

    [Column("PairedOfficerID")]
    public int? PairedOfficerId { get; set; }

    [ForeignKey("PairedOfficerId")]
    [InverseProperty("Iotdevices")]
    public virtual Policeofficer? PairedOfficer { get; set; }

    [InverseProperty("Device")]
    public virtual ICollection<Emissionreport> Emissionreports { get; set; } = new List<Emissionreport>();
}
