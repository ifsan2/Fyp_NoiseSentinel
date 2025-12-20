namespace NoiseSentinel.BLL.Configuration;

/// <summary>
/// Configuration settings for email/SMTP.
/// </summary>
public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string AppPassword { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public int OtpExpirationMinutes { get; set; } = 15;
}
