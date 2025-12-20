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
}
