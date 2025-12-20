using NoiseSentinel.BLL.Common;
using NoiseSentinel.BLL.DTOs.Public;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for public status check operations.
/// Allows accused persons to verify their identity and view case status.
/// </summary>
public interface IPublicStatusService
{
    /// <summary>
    /// Requests an OTP for public status check. Validates vehicle, CNIC, and email match.
    /// </summary>
    Task<ServiceResult<string>> RequestStatusOtpAsync(RequestStatusOtpDto dto);

    /// <summary>
    /// Verifies the OTP and returns an access token if successful.
    /// </summary>
    Task<ServiceResult<StatusOtpVerificationResponseDto>> VerifyStatusOtpAsync(VerifyStatusOtpDto dto);

    /// <summary>
    /// Gets the complete case status using a valid access token.
    /// </summary>
    Task<ServiceResult<PublicCaseStatusResponseDto>> GetCaseStatusAsync(string accessToken);
}
