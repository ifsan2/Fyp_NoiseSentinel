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
}
