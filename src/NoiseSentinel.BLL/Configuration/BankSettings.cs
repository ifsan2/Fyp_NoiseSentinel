namespace NoiseSentinel.BLL.Configuration;

/// <summary>
/// Bank account settings configured in appsettings.json.
/// Used for challan payment information.
/// </summary>
public class BankSettings
{
    public string AccountTitle { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string IBAN { get; set; } = string.Empty;

    /// <summary>
    /// Returns formatted bank details string for challan.
    /// </summary>
    public string GetFormattedDetails()
    {
        return $"Title: {AccountTitle}, Account: {AccountNumber}, Bank: {BankName}, Branch: {BranchCode}, IBAN: {IBAN}";
    }
}
