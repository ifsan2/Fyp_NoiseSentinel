using System.ComponentModel.DataAnnotations;

namespace NoiseSentinel.BLL.DTOs.Case;

/// <summary>
/// DTO for assigning/reassigning judge to a case.
/// </summary>
public class AssignJudgeDto
{
    [Required(ErrorMessage = "Case ID is required")]
    public int CaseId { get; set; }

    [Required(ErrorMessage = "Judge ID is required")]
    public int JudgeId { get; set; }
}