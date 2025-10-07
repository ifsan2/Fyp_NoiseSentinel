using System;

namespace NoiseSentinel.BLL.DTOs.Fir;

/// <summary>
/// DTO for FIR list item (summary view).
/// </summary>
public class FirListItemDto
{
    public int FirId { get; set; }
    public string FirNo { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public string AccusedName { get; set; } = string.Empty;
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public DateTime DateFiled { get; set; }
    public string FirStatus { get; set; } = string.Empty;
    public bool HasCase { get; set; }
}