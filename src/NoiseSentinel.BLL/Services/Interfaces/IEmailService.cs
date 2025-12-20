using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services.Interfaces;

/// <summary>
/// Service interface for sending emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email verification message with OTP and verification link.
    /// </summary>
    Task SendEmailVerificationAsync(string toEmail, string fullName, string otp, string verificationLink);

    /// <summary>
    /// Sends a welcome email after successful verification.
    /// </summary>
    Task SendWelcomeEmailAsync(string toEmail, string fullName);

    /// <summary>
    /// Sends a password reset email.
    /// </summary>
    Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetLink);

    /// <summary>
    /// Sends combined account creation email with OTP for verification AND temporary password for login.
    /// </summary>
    Task SendAccountCreationEmailAsync(string toEmail, string fullName, string otp, string temporaryPassword, string role);

    // ========================================================================
    // CASE EVENT NOTIFICATION EMAILS
    // ========================================================================

    /// <summary>
    /// Sends a notification email when a challan is created.
    /// </summary>
    Task SendChallanCreatedEmailAsync(
        string toEmail,
        string accusedName,
        string challanId,
        string vehiclePlateNo,
        string violationType,
        decimal penaltyAmount,
        DateTime issueDate,
        DateTime dueDate,
        string officerName,
        string stationName);

    /// <summary>
    /// Sends a notification email when an FIR is filed.
    /// </summary>
    Task SendFirCreatedEmailAsync(
        string toEmail,
        string accusedName,
        string firNo,
        string challanId,
        string violationType,
        DateTime dateFiled,
        string stationName);

    /// <summary>
    /// Sends a notification email when a case is created.
    /// </summary>
    Task SendCaseCreatedEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        string firNo,
        string courtName,
        string judgeName,
        DateTime? hearingDate);

    /// <summary>
    /// Sends a notification email when a hearing is scheduled/updated.
    /// </summary>
    Task SendHearingScheduledEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        DateTime hearingDate,
        string courtName,
        string judgeName);

    /// <summary>
    /// Sends a notification email when a verdict is announced.
    /// </summary>
    Task SendVerdictAnnouncedEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        string verdict,
        string caseStatus,
        string courtName,
        string judgeName);

    /// <summary>
    /// Sends a notification email when a case statement is added.
    /// </summary>
    Task SendCaseStatementAddedEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        string statementBy,
        string statementSummary,
        DateTime statementDate);

    /// <summary>
    /// Sends OTP for public status check.
    /// </summary>
    Task SendPublicStatusOtpEmailAsync(
        string toEmail,
        string accusedName,
        string otp,
        string vehicleNo);

    // ========================================================================
    // PASSWORD RESET EMAILS
    // ========================================================================

    /// <summary>
    /// Sends OTP for password reset.
    /// </summary>
    Task SendPasswordResetOtpAsync(string toEmail, string fullName, string otp);

    /// <summary>
    /// Sends notification that password was changed.
    /// </summary>
    Task SendPasswordChangedNotificationAsync(string toEmail, string fullName);
}
