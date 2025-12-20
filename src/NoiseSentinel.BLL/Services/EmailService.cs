using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using NoiseSentinel.BLL.Configuration;
using NoiseSentinel.BLL.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace NoiseSentinel.BLL.Services;

/// <summary>
/// Email service implementation using MailKit and Gmail SMTP.
/// </summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Sends an email verification message with OTP and verification link.
    /// </summary>
    public async Task SendEmailVerificationAsync(string toEmail, string fullName, string otp, string verificationLink)
    {
        var subject = "Verify Your Email - NoiseSentinel";
        var htmlBody = GetEmailVerificationTemplate(fullName, otp, verificationLink);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <summary>
    /// Sends a welcome email after successful verification.
    /// </summary>
    public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
    {
        var subject = "Welcome to NoiseSentinel!";
        var htmlBody = GetWelcomeEmailTemplate(fullName);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <summary>
    /// Sends a password reset email.
    /// </summary>
    public async Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetLink)
    {
        var subject = "Reset Your Password - NoiseSentinel";
        var htmlBody = GetPasswordResetTemplate(fullName, resetLink);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <summary>
    /// Sends combined account creation email with OTP for verification AND temporary password for login.
    /// </summary>
    public async Task SendAccountCreationEmailAsync(string toEmail, string fullName, string otp, string temporaryPassword, string role)
    {
        var subject = "Your NoiseSentinel Account - Verify Email & Login Credentials";
        var htmlBody = GetAccountCreationTemplate(fullName, otp, temporaryPassword, role);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /// <summary>
    /// Core method to send email using MailKit.
    /// </summary>
    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Connect to SMTP server
            await client.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, 
                _emailSettings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

            // Authenticate
            await client.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.AppPassword);

            // Send email
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }

    // ========================================================================
    // EMAIL TEMPLATES
    // ========================================================================

    /// <summary>
    /// HTML template for email verification with OTP and link.
    /// </summary>
    private string GetEmailVerificationTemplate(string fullName, string otp, string verificationLink)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verify Your Email</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>NoiseSentinel</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>Environmental Monitoring System</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px; color: #333333; font-size: 24px;'>Verify Your Email Address</h2>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Hi <strong>{fullName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Thank you for registering with NoiseSentinel. To complete your registration, please verify your email address using the OTP below:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style='background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;'>
                                <p style='margin: 0 0 10px; color: #666666; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>Your Verification Code</p>
                                <p style='margin: 0; color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;'>{otp}</p>
                                <p style='margin: 10px 0 0; color: #999999; font-size: 12px;'>Valid for {_emailSettings.OtpExpirationMinutes} minutes</p>
                            </div>
                            
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Or click the button below to verify instantly:
                            </p>
                            
                            <!-- Verification Button -->
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{verificationLink}' style='display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);'>
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <p style='margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.5;'>
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style='margin: 5px 0 0; color: #667eea; font-size: 12px; word-break: break-all;'>
                                {verificationLink}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;'>
                                If you didn't create an account with NoiseSentinel, please ignore this email.
                            </p>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    /// <summary>
    /// HTML template for welcome email after verification.
    /// </summary>
    private string GetWelcomeEmailTemplate(string fullName)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Welcome to NoiseSentinel</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>🎉 Welcome to NoiseSentinel!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Hi <strong>{fullName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Your email has been successfully verified! Welcome to the NoiseSentinel environmental monitoring system.
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                You can now access all features of your account and start monitoring environmental noise levels.
                            </p>
                            
                            <div style='background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;'>
                                <p style='margin: 0; color: #333333; font-size: 14px; line-height: 1.6;'>
                                    <strong>What's Next?</strong><br>
                                    • Complete your profile settings<br>
                                    • Explore the dashboard<br>
                                    • Set up your monitoring preferences<br>
                                    • Contact support if you need assistance
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    /// <summary>
    /// HTML template for password reset.
    /// </summary>
    private string GetPasswordResetTemplate(string fullName, string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Your Password</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>NoiseSentinel</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>Password Reset Request</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px; color: #333333; font-size: 24px;'>Reset Your Password</h2>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Hi <strong>{fullName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            
                            <!-- Reset Button -->
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{resetLink}' style='display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);'>
                                    Reset Password
                                </a>
                            </div>
                            
                            <p style='margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.5;'>
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style='margin: 5px 0 0; color: #667eea; font-size: 12px; word-break: break-all;'>
                                {resetLink}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;'>
                                If you didn't request a password reset, please ignore this email or contact support.
                            </p>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    /// <summary>
    /// HTML template for combined account creation email with OTP and temporary password.
    /// </summary>
    private string GetAccountCreationTemplate(string fullName, string otp, string temporaryPassword, string role)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Your NoiseSentinel Account</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>NoiseSentinel</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>Account Created Successfully</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px; color: #333333; font-size: 24px;'>Welcome to NoiseSentinel</h2>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Hi <strong>{fullName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Your account has been created as <strong>{role}</strong>. Follow these steps to access your account:
                            </p>
                            
                            <!-- Step 1: Login Credentials -->
                            <div style='background-color: #f3e5f5; border-left: 4px solid #9c27b0; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <p style='margin: 0 0 10px; color: #7b1fa2; font-size: 16px; font-weight: bold;'>Step 1: Login with Temporary Password</p>
                                <p style='margin: 0 0 15px; color: #666666; font-size: 14px;'>Use this password to login:</p>
                                <p style='margin: 0; color: #9c27b0; font-size: 24px; font-weight: bold; letter-spacing: 2px; font-family: monospace; word-break: break-all;'>{temporaryPassword}</p>
                            </div>

                            <!-- Step 2: Verify Email -->
                            <div style='background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <p style='margin: 0 0 10px; color: #1565c0; font-size: 16px; font-weight: bold;'>Step 2: Enter OTP to Verify Email</p>
                                <p style='margin: 0 0 15px; color: #666666; font-size: 14px;'>After login, enter this 6-digit verification code:</p>
                                <p style='margin: 0; color: #2196f3; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;'>{otp}</p>
                                <p style='margin: 10px 0 0; color: #999999; font-size: 12px;'>This code expires in 15 minutes</p>
                            </div>

                            <!-- Step 3: Change Password -->
                            <div style='background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <p style='margin: 0 0 10px; color: #e65100; font-size: 16px; font-weight: bold;'>Step 3: Change Your Password</p>
                                <p style='margin: 0; color: #666666; font-size: 14px;'>For security, you'll be required to create a new password after your first login.</p>
                            </div>

                            <!-- Security Notice -->
                            <div style='background-color: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0 0 5px; color: #c62828; font-size: 14px; line-height: 1.5;'>
                                    <strong>🔒 Security Reminder:</strong>
                                </p>
                                <p style='margin: 0; color: #c62828; font-size: 13px; line-height: 1.6;'>
                                    Never share your credentials with anyone. Keep this email secure and delete it after changing your password.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;'>
                                If you did not expect this account creation, please contact your administrator immediately.
                            </p>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    // ========================================================================
    // CASE EVENT NOTIFICATION EMAIL IMPLEMENTATIONS
    // ========================================================================

    /// <inheritdoc />
    public async Task SendChallanCreatedEmailAsync(
        string toEmail,
        string accusedName,
        string challanId,
        string vehiclePlateNo,
        string violationType,
        decimal penaltyAmount,
        DateTime issueDate,
        DateTime dueDate,
        string officerName,
        string stationName)
    {
        var subject = $"Traffic Challan #{challanId} Issued - NoiseSentinel";
        var htmlBody = GetChallanCreatedTemplate(accusedName, challanId, vehiclePlateNo, violationType, 
            penaltyAmount, issueDate, dueDate, officerName, stationName);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendFirCreatedEmailAsync(
        string toEmail,
        string accusedName,
        string firNo,
        string challanId,
        string violationType,
        DateTime dateFiled,
        string stationName)
    {
        var subject = $"FIR {firNo} Filed Against You - NoiseSentinel";
        var htmlBody = GetFirCreatedTemplate(accusedName, firNo, challanId, violationType, dateFiled, stationName);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendCaseCreatedEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        string firNo,
        string courtName,
        string judgeName,
        DateTime? hearingDate)
    {
        var subject = $"Court Case {caseNo} Registered - NoiseSentinel";
        var htmlBody = GetCaseCreatedTemplate(accusedName, caseNo, firNo, courtName, judgeName, hearingDate);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendHearingScheduledEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        DateTime hearingDate,
        string courtName,
        string judgeName)
    {
        var subject = $"Hearing Scheduled for Case {caseNo} - NoiseSentinel";
        var htmlBody = GetHearingScheduledTemplate(accusedName, caseNo, hearingDate, courtName, judgeName);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendVerdictAnnouncedEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        string verdict,
        string caseStatus,
        string courtName,
        string judgeName)
    {
        var subject = $"Verdict Announced for Case {caseNo} - NoiseSentinel";
        var htmlBody = GetVerdictAnnouncedTemplate(accusedName, caseNo, verdict, caseStatus, courtName, judgeName);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendCaseStatementAddedEmailAsync(
        string toEmail,
        string accusedName,
        string caseNo,
        string statementBy,
        string statementSummary,
        DateTime statementDate)
    {
        var subject = $"New Statement Added to Case {caseNo} - NoiseSentinel";
        var htmlBody = GetCaseStatementAddedTemplate(accusedName, caseNo, statementBy, statementSummary, statementDate);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendPublicStatusOtpEmailAsync(
        string toEmail,
        string accusedName,
        string otp,
        string vehicleNo)
    {
        var subject = "Your OTP for Case Status Check - NoiseSentinel";
        var htmlBody = GetPublicStatusOtpTemplate(accusedName, otp, vehicleNo);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    // ========================================================================
    // CASE EVENT EMAIL TEMPLATES
    // ========================================================================

    private string GetChallanCreatedTemplate(
        string accusedName,
        string challanId,
        string vehiclePlateNo,
        string violationType,
        decimal penaltyAmount,
        DateTime issueDate,
        DateTime dueDate,
        string officerName,
        string stationName)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Traffic Challan Issued</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>⚠️ Traffic Challan Issued</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Environmental Monitoring</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                A traffic challan has been issued against your vehicle for a noise/environmental violation.
                            </p>
                            
                            <!-- Challan Details Box -->
                            <div style='background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <h3 style='margin: 0 0 15px; color: #856404; font-size: 18px;'>📋 Challan Details</h3>
                                <table style='width: 100%; border-collapse: collapse;'>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #ffc107;'><strong>Challan No:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #ffc107; text-align: right;'>{challanId}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #ffc107;'><strong>Vehicle No:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #ffc107; text-align: right;'>{vehiclePlateNo}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #ffc107;'><strong>Violation Type:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #ffc107; text-align: right;'>{violationType}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #ffc107;'><strong>Penalty Amount:</strong></td>
                                        <td style='padding: 8px 0; color: #c62828; font-size: 16px; font-weight: bold; border-bottom: 1px solid #ffc107; text-align: right;'>Rs. {penaltyAmount:N0}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #ffc107;'><strong>Issue Date:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #ffc107; text-align: right;'>{issueDate:dd MMM yyyy}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px;'><strong>Due Date:</strong></td>
                                        <td style='padding: 8px 0; color: #c62828; font-size: 14px; font-weight: bold; text-align: right;'>{dueDate:dd MMM yyyy}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Officer Details -->
                            <div style='background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #1565c0; font-size: 14px;'>
                                    <strong>Issuing Officer:</strong> {officerName}<br>
                                    <strong>Police Station:</strong> {stationName}
                                </p>
                            </div>

                            <!-- Warning -->
                            <div style='background-color: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #c62828; font-size: 14px; line-height: 1.5;'>
                                    <strong>⚠️ Important:</strong> Please pay the challan before the due date to avoid legal proceedings. 
                                    Unpaid challans may result in FIR filing and court proceedings.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetFirCreatedTemplate(
        string accusedName,
        string firNo,
        string challanId,
        string violationType,
        DateTime dateFiled,
        string stationName)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>FIR Filed</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #c62828 0%, #8e0000 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>🚨 FIR Filed Against You</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Legal Notice</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                A First Information Report (FIR) has been filed against you due to non-payment of a cognizable violation challan.
                            </p>
                            
                            <!-- FIR Details Box -->
                            <div style='background-color: #ffebee; border: 2px solid #c62828; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <h3 style='margin: 0 0 15px; color: #c62828; font-size: 18px;'>📄 FIR Details</h3>
                                <table style='width: 100%; border-collapse: collapse;'>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #f44336;'><strong>FIR No:</strong></td>
                                        <td style='padding: 8px 0; color: #c62828; font-size: 16px; font-weight: bold; border-bottom: 1px solid #f44336; text-align: right;'>{firNo}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #f44336;'><strong>Related Challan:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #f44336; text-align: right;'>#{challanId}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #f44336;'><strong>Violation Type:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #f44336; text-align: right;'>{violationType}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #f44336;'><strong>Date Filed:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #f44336; text-align: right;'>{dateFiled:dd MMM yyyy}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px;'><strong>Police Station:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; text-align: right;'>{stationName}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Legal Notice -->
                            <div style='background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #e65100; font-size: 14px; line-height: 1.6;'>
                                    <strong>⚖️ Legal Notice:</strong> This matter will be forwarded to the Court Authority for further proceedings. 
                                    You may be summoned to appear in court. Please consult with a legal advisor.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetCaseCreatedTemplate(
        string accusedName,
        string caseNo,
        string firNo,
        string courtName,
        string judgeName,
        DateTime? hearingDate)
    {
        var hearingInfo = hearingDate.HasValue 
            ? $"<tr><td style='padding: 8px 0; color: #666666; font-size: 14px;'><strong>First Hearing:</strong></td><td style='padding: 8px 0; color: #c62828; font-size: 14px; font-weight: bold; text-align: right;'>{hearingDate:dd MMM yyyy}</td></tr>"
            : "";

        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Court Case Registered</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>⚖️ Court Case Registered</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Court Notice</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                A court case has been registered against you based on the FIR filed by the police station.
                            </p>
                            
                            <!-- Case Details Box -->
                            <div style='background-color: #e8eaf6; border: 2px solid #3949ab; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <h3 style='margin: 0 0 15px; color: #3949ab; font-size: 18px;'>📁 Case Details</h3>
                                <table style='width: 100%; border-collapse: collapse;'>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #9fa8da;'><strong>Case No:</strong></td>
                                        <td style='padding: 8px 0; color: #3949ab; font-size: 16px; font-weight: bold; border-bottom: 1px solid #9fa8da; text-align: right;'>{caseNo}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #9fa8da;'><strong>Related FIR:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #9fa8da; text-align: right;'>{firNo}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #9fa8da;'><strong>Court:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #9fa8da; text-align: right;'>{courtName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #9fa8da;'><strong>Presiding Judge:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #9fa8da; text-align: right;'>{judgeName}</td>
                                    </tr>
                                    {hearingInfo}
                                </table>
                            </div>

                            <!-- Notice -->
                            <div style='background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #e65100; font-size: 14px; line-height: 1.6;'>
                                    <strong>📌 Important:</strong> Please ensure your attendance on the hearing date. 
                                    Failure to appear may result in legal consequences including arrest warrant.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetHearingScheduledTemplate(
        string accusedName,
        string caseNo,
        DateTime hearingDate,
        string courtName,
        string judgeName)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Hearing Scheduled</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #26a69a 0%, #00796b 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>📅 Hearing Scheduled</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Court Notice</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                A hearing has been scheduled for your court case.
                            </p>
                            
                            <!-- Hearing Details Box -->
                            <div style='background-color: #e0f2f1; border: 2px solid #00796b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>
                                <h3 style='margin: 0 0 10px; color: #00796b; font-size: 18px;'>🗓️ Hearing Date</h3>
                                <p style='margin: 0; color: #00796b; font-size: 32px; font-weight: bold;'>{hearingDate:dd MMM yyyy}</p>
                                <p style='margin: 10px 0 0; color: #666666; font-size: 14px;'>Case: {caseNo}</p>
                            </div>

                            <div style='background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                                <p style='margin: 0 0 8px; color: #333333; font-size: 14px;'><strong>Court:</strong> {courtName}</p>
                                <p style='margin: 0; color: #333333; font-size: 14px;'><strong>Presiding Judge:</strong> {judgeName}</p>
                            </div>

                            <div style='background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #c62828; font-size: 14px; line-height: 1.6;'>
                                    <strong>⚠️ Mandatory Attendance:</strong> Your presence is required on the hearing date. 
                                    Non-appearance may result in adverse legal action.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetVerdictAnnouncedTemplate(
        string accusedName,
        string caseNo,
        string verdict,
        string caseStatus,
        string courtName,
        string judgeName)
    {
        var statusColor = caseStatus.ToLower() switch
        {
            "acquitted" => "#4caf50",
            "convicted" => "#f44336",
            "dismissed" => "#ff9800",
            _ => "#9e9e9e"
        };

        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verdict Announced</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>⚖️ Verdict Announced</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Court Decision</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                The verdict for your court case has been announced.
                            </p>
                            
                            <!-- Verdict Box -->
                            <div style='background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>
                                <p style='margin: 0 0 5px; color: #666666; font-size: 14px;'>Case No: {caseNo}</p>
                                <p style='margin: 0 0 15px; color: {statusColor}; font-size: 24px; font-weight: bold; text-transform: uppercase;'>{caseStatus}</p>
                            </div>

                            <!-- Verdict Details -->
                            <div style='background-color: #e8eaf6; border-left: 4px solid #3949ab; padding: 15px; margin: 20px 0;'>
                                <h4 style='margin: 0 0 10px; color: #3949ab; font-size: 16px;'>📜 Verdict Summary</h4>
                                <p style='margin: 0; color: #333333; font-size: 14px; line-height: 1.6;'>{verdict}</p>
                            </div>

                            <div style='background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                                <p style='margin: 0 0 8px; color: #333333; font-size: 14px;'><strong>Court:</strong> {courtName}</p>
                                <p style='margin: 0; color: #333333; font-size: 14px;'><strong>Judge:</strong> {judgeName}</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetCaseStatementAddedTemplate(
        string accusedName,
        string caseNo,
        string statementBy,
        string statementSummary,
        DateTime statementDate)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Case Statement Added</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #546e7a 0%, #37474f 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>📝 Case Statement Added</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Case Update</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                A new statement has been added to your court case.
                            </p>
                            
                            <!-- Statement Box -->
                            <div style='background-color: #eceff1; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                                <table style='width: 100%; border-collapse: collapse;'>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #cfd8dc;'><strong>Case No:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #cfd8dc; text-align: right;'>{caseNo}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #cfd8dc;'><strong>Statement By:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; border-bottom: 1px solid #cfd8dc; text-align: right;'>{statementBy}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; color: #666666; font-size: 14px;'><strong>Date:</strong></td>
                                        <td style='padding: 8px 0; color: #333333; font-size: 14px; text-align: right;'>{statementDate:dd MMM yyyy}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style='background-color: #f5f5f5; border-left: 4px solid #546e7a; padding: 15px; margin: 20px 0;'>
                                <h4 style='margin: 0 0 10px; color: #37474f; font-size: 16px;'>Statement Summary:</h4>
                                <p style='margin: 0; color: #333333; font-size: 14px; line-height: 1.6;'>{statementSummary}</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetPublicStatusOtpTemplate(string accusedName, string otp, string vehicleNo)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Case Status Verification OTP</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>🔐 Verification Code</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Case Status Check</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{accusedName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                You have requested to check the status of cases related to vehicle <strong>{vehicleNo}</strong>.
                            </p>
                            
                            <!-- OTP Box -->
                            <div style='background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;'>
                                <p style='margin: 0 0 10px; color: #666666; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>Your Verification Code</p>
                                <p style='margin: 0; color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;'>{otp}</p>
                                <p style='margin: 10px 0 0; color: #999999; font-size: 12px;'>Valid for 15 minutes</p>
                            </div>

                            <p style='margin: 0; color: #666666; font-size: 14px; line-height: 1.5;'>
                                Enter this code on the status check page to view your case details, challans, FIRs, and court proceedings.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;'>
                                If you didn't request this code, please ignore this email.
                            </p>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    // ========================================================================
    // PASSWORD RESET EMAIL METHODS
    // ========================================================================

    /// <inheritdoc />
    public async Task SendPasswordResetOtpAsync(string toEmail, string fullName, string otp)
    {
        var subject = "Password Reset OTP - NoiseSentinel";
        var htmlBody = GetPasswordResetOtpTemplate(fullName, otp);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc />
    public async Task SendPasswordChangedNotificationAsync(string toEmail, string fullName)
    {
        var subject = "Password Changed Successfully - NoiseSentinel";
        var htmlBody = GetPasswordChangedTemplate(fullName);

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    private string GetPasswordResetOtpTemplate(string fullName, string otp)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Password Reset OTP</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>🔐 Password Reset</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Environmental Monitoring</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{fullName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                We received a request to reset your password. Use the OTP below to complete the password reset process.
                            </p>
                            
                            <!-- OTP Box -->
                            <div style='background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;'>
                                <p style='margin: 0 0 10px; color: #666666; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>Your Password Reset Code</p>
                                <p style='margin: 0; color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;'>{otp}</p>
                                <p style='margin: 10px 0 0; color: #999999; font-size: 12px;'>Valid for 15 minutes</p>
                            </div>

                            <p style='margin: 0 0 15px; color: #666666; font-size: 14px; line-height: 1.5;'>
                                Enter this code in the app or website to set your new password.
                            </p>

                            <!-- Warning Box -->
                            <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #856404; font-size: 14px;'>
                                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;'>
                                This is an automated email. Please do not reply.
                            </p>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetPasswordChangedTemplate(string fullName)
    {
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Password Changed</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td style='padding: 40px 0; text-align: center; background-color: #f4f4f4;'>
                <table role='presentation' style='width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>✅ Password Changed</h1>
                            <p style='margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>NoiseSentinel - Environmental Monitoring</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Dear <strong>{fullName}</strong>,
                            </p>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;'>
                                Your password has been successfully changed. You can now log in with your new password.
                            </p>
                            
                            <!-- Success Box -->
                            <div style='background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>
                                <p style='margin: 0; color: #155724; font-size: 16px; font-weight: bold;'>
                                    🎉 Password Reset Successful!
                                </p>
                            </div>

                            <!-- Warning Box -->
                            <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #856404; font-size: 14px;'>
                                    <strong>⚠️ Security Notice:</strong> If you didn't make this change, please contact support immediately and secure your account.
                                </p>
                            </div>

                            <p style='margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.5;'>
                                Changed on: <strong>{DateTime.UtcNow:dd MMM yyyy 'at' HH:mm} UTC</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;'>
                                This is an automated email. Please do not reply.
                            </p>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center;'>
                                &copy; 2025 NoiseSentinel. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
