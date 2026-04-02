namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

/// <summary>
/// Valide un token Microsoft SSO (id_token Azure AD) et retourne les claims.
/// </summary>
public class MicrosoftSsoService
{
    private static readonly string[] AllowedDomains = ["collegelacite.ca", "lacitec.on.ca"];

    private readonly IConfiguration _configuration;
    private readonly ILogger<MicrosoftSsoService> _logger;

    public MicrosoftSsoService(IConfiguration configuration, ILogger<MicrosoftSsoService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<MicrosoftUserInfo?> ValidateTokenAsync(string idToken)
    {
        try
        {
            // Appel Microsoft Graph pour valider et récupérer les infos utilisateur
            var tenantId = _configuration["Microsoft:TenantId"];
            var clientId = _configuration["Microsoft:ClientId"];

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {idToken}");

            var response = await httpClient.GetAsync("https://graph.microsoft.com/v1.0/me");
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Validation Microsoft SSO échouée: {Status}", response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<MicrosoftGraphUserResponse>();
            if (json == null) return null;

            var email = json.Mail?.Trim();
            if (string.IsNullOrWhiteSpace(email) || !IsAllowedSchoolEmail(email))
            {
                _logger.LogWarning("Email non autorisé: {Email}", json.Mail);
                return null;
            }

            return new MicrosoftUserInfo(
                ObjectId: json.Id,
                Email: email,
                FirstName: json.GivenName,
                LastName: json.Surname,
                AvatarUrl: null             // récupéré séparément via /photo
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur validation Microsoft SSO");
            return null;
        }
    }

    private record MicrosoftGraphUserResponse(
        string Id, string Mail, string GivenName, string Surname);

    private static bool IsAllowedSchoolEmail(string email)
    {
        var atIndex = email.IndexOf('@');
        if (atIndex <= 0 || atIndex == email.Length - 1)
            return false;

        var matricule = email[..atIndex];
        var domain = email[(atIndex + 1)..];

        if (!AllowedDomains.Contains(domain, StringComparer.OrdinalIgnoreCase))
            return false;

        return matricule.Length >= 7 && matricule.All(char.IsDigit) && matricule[0] != '0';
    }
}

public record MicrosoftUserInfo(
    string ObjectId,
    string Email,
    string FirstName,
    string LastName,
    string? AvatarUrl);
