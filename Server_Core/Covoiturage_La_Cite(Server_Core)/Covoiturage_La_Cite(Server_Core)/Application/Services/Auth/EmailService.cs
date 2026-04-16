using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

public class EmailService : IEmailService
{
    private readonly IConfiguration     _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IHttpClientFactory _http;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory http)
    {
        _configuration = configuration;
        _logger        = logger;
        _http          = http;
    }

    // ── Envoi via Resend API ───────────────────────────────────────────────

    private async Task SendAsync(string toEmail, string subject, string html, CancellationToken ct)
    {
        var apiKey    = _configuration["Resend:ApiKey"] ?? string.Empty;
        var fromName  = _configuration["Resend:FromName"]  ?? "Covoiturage La Cité";
        var fromEmail = _configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("[Email:LogOnly] {Subject} → {Email}", subject, toEmail);
            return;
        }

        var payload = JsonSerializer.Serialize(new
        {
            from    = $"{fromName} <{fromEmail}>",
            to      = new[] { toEmail },
            subject,
            html,
        });

        var client = _http.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var response = await client.PostAsync(
            "https://api.resend.com/emails",
            new StringContent(payload, Encoding.UTF8, "application/json"),
            ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("[Resend] {Status} — {Body}", (int)response.StatusCode, body);
            throw new InvalidOperationException($"Resend API error {(int)response.StatusCode}");
        }

        _logger.LogInformation("[Resend] Email envoyé à {Email}", toEmail);
    }

    // ── IEmailService ─────────────────────────────────────────────────────

    public Task SendOtpAsync(string toEmail, string otpCode, CancellationToken ct = default)
        => SendAsync(toEmail, $"Code de vérification — {otpCode}", BuildOtpHtml(otpCode), ct);

    public Task SendNotificationEmailAsync(
        string toEmail, string firstName,
        string notificationTitle, string notificationBody,
        string? deepLink, CancellationToken ct = default)
    {
        var webUrl = _configuration["App:WebUrl"] ?? "http://localhost:3000";
        return SendAsync(toEmail, notificationTitle,
            BuildNotificationHtml(firstName, notificationTitle, notificationBody, deepLink, webUrl), ct);
    }

    // ── Templates HTML ────────────────────────────────────────────────────

    private static string BuildOtpHtml(string otpCode) => $"""
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">
                      Covoiturage La Cité
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 32px 24px;">
                    <p style="margin:0 0 8px;color:#374151;font-size:16px;">Bonjour,</p>
                    <p style="margin:0 0 24px;color:#374151;font-size:16px;">
                      Voici votre code de vérification :
                    </p>
                    <div style="text-align:center;margin:0 0 24px;">
                      <div style="display:inline-block;background:#f0f4ff;border:2px dashed #2563eb;
                                  border-radius:12px;padding:20px 40px;">
                        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1e3a8a;
                                     font-family:'Courier New',monospace;">
                          {otpCode}
                        </span>
                      </div>
                    </div>
                    <p style="margin:0 0 6px;color:#6b7280;font-size:14px;text-align:center;">
                      &#128336; Ce code expire dans <strong>5 minutes</strong>.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                      Si vous n'avez pas demandé ce code, ignorez cet email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      Collège La Cité · Ottawa, ON · Service de covoiturage
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    private static string BuildNotificationHtml(
        string firstName, string title, string body, string? deepLink, string webUrl)
    {
        var actionBlock = deepLink is not null
            ? $"""
              <div style="text-align:center;margin:24px 0 0;">
                <a href="{webUrl}{deepLink}"
                   style="display:inline-block;background:#2563eb;color:#fff;font-size:15px;font-weight:600;
                          text-decoration:none;padding:12px 28px;border-radius:8px;">
                  Voir dans l'application
                </a>
              </div>
              """
            : string.Empty;

        return $"""
            <!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background-color:#f4f4f5;padding:40px 0;">
                <tr><td align="center">
                  <table role="presentation" width="520" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;
                                box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);
                                 padding:28px 32px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">
                          Covoiturage La Cité
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 6px;color:#374151;font-size:16px;">Bonjour {firstName},</p>
                        <h2 style="margin:16px 0 12px;color:#1e3a8a;font-size:20px;">{title}</h2>
                        <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">{body}</p>
                        {actionBlock}
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb;padding:16px 32px;
                                 border-top:1px solid #e5e7eb;text-align:center;">
                        <p style="margin:0;color:#9ca3af;font-size:12px;">
                          Collège La Cité · Ottawa, ON · Service de covoiturage
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }
}
