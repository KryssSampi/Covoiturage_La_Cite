using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendOtpAsync(string toEmail, string otpCode, CancellationToken ct = default)
    {
        var smtpHost = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
        var smtpPort = _configuration.GetValue("Smtp:Port", 587);
        var smtpUser = _configuration["Smtp:User"] ?? throw new InvalidOperationException("Smtp:User non configuré");
        var smtpPass = _configuration["Smtp:Password"] ?? throw new InvalidOperationException("Smtp:Password non configuré");
        var fromName = _configuration["Smtp:FromName"] ?? "Covoiturage La Cité";
        var fromEmail = _configuration["Smtp:FromEmail"] ?? smtpUser;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = $"Code de vérification — {otpCode}";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="utf-8"></head>
                <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
                    <tr><td align="center">
                      <table role="presentation" width="480" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:28px 32px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">
                              Covoiturage La Cité
                            </h1>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:36px 32px 24px;">
                            <p style="margin:0 0 8px;color:#374151;font-size:16px;">Bonjour,</p>
                            <p style="margin:0 0 24px;color:#374151;font-size:16px;">
                              Voici votre code de vérification :
                            </p>
                            <!-- Code OTP -->
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
                        <!-- Footer -->
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
                """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.StartTls, ct);
        await client.AuthenticateAsync(smtpUser, smtpPass, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);

        _logger.LogInformation("OTP envoyé à {Email}", toEmail);
    }
}
