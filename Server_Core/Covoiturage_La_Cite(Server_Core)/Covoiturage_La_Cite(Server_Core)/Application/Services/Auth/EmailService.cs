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
        var apiKey    = _configuration["Brevo:ApiKey"] ?? string.Empty;
        var fromName  = _configuration["Brevo:FromName"]  ?? "Covoiturage La Cité";
        var fromEmail = _configuration["Brevo:FromEmail"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("[Email:LogOnly] {Subject} → {Email}", subject, toEmail);
            return;
        }

        var payload = JsonSerializer.Serialize(new
        {
            sender  = new { name = fromName, email = fromEmail },
            to      = new[] { new { email = toEmail } },
            subject,
            htmlContent = html,
        });

        var client = _http.CreateClient();
        client.DefaultRequestHeaders.Add("api-key", apiKey);

        var response = await client.PostAsync(
            "https://api.brevo.com/v3/smtp/email",
            new StringContent(payload, Encoding.UTF8, "application/json"),
            ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("[Brevo] {Status} — {Body}", (int)response.StatusCode, body);
            throw new InvalidOperationException($"Brevo API error {(int)response.StatusCode}");
        }

        _logger.LogInformation("[Brevo] Email envoyé à {Email}", toEmail);
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

    public Task SendWelcomeEmailAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var webUrl = _configuration["App:WebUrl"] ?? "http://localhost:3000";
        return SendAsync(toEmail, $"Bienvenue sur Covoiturage La Cité, {firstName} ! 🎉",
            BuildWelcomeHtml(firstName, webUrl), ct);
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

    private static string BuildWelcomeHtml(string firstName, string webUrl) => $"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <title>Bienvenue sur Covoiturage La Cité</title>
        </head>
        <body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="background-color:#eef2f7;padding:40px 20px;">
            <tr><td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1);overflow:hidden;max-width:600px;">

                <!-- HEADER -->
                <tr>
                  <td style="background:linear-gradient(135deg,#08316e,#1a5bb5);padding:32px;text-align:center;">
                    <h1 style="margin:0 0 4px;color:#ffffff;font-size:30px;font-weight:800;letter-spacing:0.5px;">
                      🚗 Covoiturage La Cité
                    </h1>
                    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">
                      Collège La Cité · Ottawa
                    </p>
                  </td>
                </tr>

                <!-- HERO -->
                <tr>
                  <td style="background:linear-gradient(180deg,#f0f5ff 0%,#ffffff 100%);padding:40px 40px 32px;text-align:center;">
                    <div style="font-size:56px;line-height:1;margin-bottom:16px;">🎉</div>
                    <h2 style="margin:0 0 14px;color:#08316e;font-size:28px;font-weight:800;">
                      Bienvenue, {firstName}&nbsp;!
                    </h2>
                    <p style="margin:0 auto;color:#4b5563;font-size:16px;line-height:1.7;max-width:480px;">
                      Vous faites maintenant partie de la communauté de covoiturage du Collège La Cité.
                      Partagez vos trajets, réduisez vos frais de transport et contribuez à un campus plus vert.
                    </p>
                  </td>
                </tr>

                <!-- REWARDS -->
                <tr>
                  <td style="padding:0 32px 32px;">
                    <h3 style="margin:0 0 16px;color:#08316e;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #08316e;padding-left:12px;">
                      Vous avez déjà reçu
                    </h3>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32%" style="background:#f0f9ff;border-radius:12px;padding:20px 12px;text-align:center;border:1px solid #bfdbfe;">
                          <div style="font-size:30px;margin-bottom:6px;">🏆</div>
                          <div style="font-size:24px;font-weight:800;color:#1e3a8a;">250</div>
                          <div style="font-size:13px;color:#6b7280;margin-top:2px;">GoPoints</div>
                        </td>
                        <td width="4%"></td>
                        <td width="32%" style="background:#f0fdf4;border-radius:12px;padding:20px 12px;text-align:center;border:1px solid #86efac;">
                          <div style="font-size:30px;margin-bottom:6px;">🏅</div>
                          <div style="font-size:14px;font-weight:700;color:#166534;margin-top:4px;">Nouveau</div>
                          <div style="font-size:13px;color:#6b7280;margin-top:2px;">Membre</div>
                        </td>
                        <td width="4%"></td>
                        <td width="28%" style="background:#fffbeb;border-radius:12px;padding:20px 12px;text-align:center;border:1px solid #fde68a;">
                          <div style="font-size:30px;margin-bottom:6px;">⭐</div>
                          <div style="font-size:24px;font-weight:800;color:#92400e;">3.5</div>
                          <div style="font-size:13px;color:#6b7280;margin-top:2px;">Note initiale</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- SEPARATOR -->
                <tr><td style="padding:0 32px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>

                <!-- HOW IT WORKS -->
                <tr>
                  <td style="padding:32px;">
                    <h3 style="margin:0 0 24px;color:#08316e;font-size:20px;font-weight:700;text-align:center;">
                      🗺️ Comment ça marche ?
                    </h3>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                      <tr>
                        <td width="44" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#08316e;border-radius:50%;text-align:center;line-height:40px;color:#fff;font-size:18px;font-weight:800;">1</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:top;">
                          <div style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:4px;">Complétez votre profil</div>
                          <div style="font-size:14px;color:#6b7280;line-height:1.6;">
                            Ajoutez une photo, un numéro de téléphone et vos préférences de voyage.
                            Un profil complet inspire confiance et vous rapporte <strong style="color:#08316e;">+30 GoPoints</strong>.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                      <tr>
                        <td width="44" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#1a5bb5;border-radius:50%;text-align:center;line-height:40px;color:#fff;font-size:18px;font-weight:800;">2</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:top;">
                          <div style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:4px;">Trouvez un trajet ou publiez le vôtre</div>
                          <div style="font-size:14px;color:#6b7280;line-height:1.6;">
                            Cherchez un conducteur qui fait le même chemin, ou activez le mode conducteur
                            pour proposer vos places libres et partager les frais.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                      <tr>
                        <td width="44" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#0aad6a;border-radius:50%;text-align:center;line-height:40px;color:#fff;font-size:18px;font-weight:800;">3</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:top;">
                          <div style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:4px;">Réservez et covoiturez !</div>
                          <div style="font-size:14px;color:#6b7280;line-height:1.6;">
                            Envoyez une demande au conducteur. Une fois acceptée, vous recevrez
                            une confirmation et pourrez suivre le trajet en temps réel sur la carte.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="44" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#f59e0b;border-radius:50%;text-align:center;line-height:40px;color:#fff;font-size:18px;font-weight:800;">4</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:top;">
                          <div style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:4px;">Laissez un avis</div>
                          <div style="font-size:14px;color:#6b7280;line-height:1.6;">
                            Après chaque trajet, prenez 30 secondes pour évaluer votre covoitureur.
                            Les avis renforcent la confiance dans toute la communauté
                            et vous rapportent <strong style="color:#08316e;">+25 GoPoints</strong>.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- SEPARATOR -->
                <tr><td style="padding:0 32px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>

                <!-- GOTASKS -->
                <tr>
                  <td style="padding:32px;background:#f8faff;">
                    <h3 style="margin:0 0 8px;color:#08316e;font-size:20px;font-weight:700;text-align:center;">
                      🎯 Vos défis GoTasks
                    </h3>
                    <p style="margin:0 0 22px;color:#6b7280;font-size:13px;text-align:center;line-height:1.5;">
                      Complétez des défis pour grimper dans les rangs et débloquer des avantages exclusifs.
                      Plus votre GoScore est élevé, plus vous avez accès à des fonctionnalités prioritaires.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:11px 0;border-bottom:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td width="38"><div style="width:32px;height:32px;background:#dcfce7;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">✅</div></td>
                            <td style="padding-left:10px;">
                              <div style="font-size:14px;font-weight:600;color:#166534;">GT-000 · Bienvenue</div>
                              <div style="font-size:12px;color:#6b7280;">Vous avez rejoint la communauté</div>
                            </td>
                            <td style="text-align:right;"><span style="background:#dcfce7;color:#166534;font-size:13px;font-weight:700;padding:3px 10px;border-radius:20px;">+250 pts ✓</span></td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:11px 0;border-bottom:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td width="38"><div style="width:32px;height:32px;background:#f0f4ff;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">🪪</div></td>
                            <td style="padding-left:10px;">
                              <div style="font-size:14px;font-weight:600;color:#1f2937;">GT-003 · Profil complet</div>
                              <div style="font-size:12px;color:#6b7280;">Photo, téléphone, bio, préférences</div>
                            </td>
                            <td style="text-align:right;"><span style="background:#e0e7ff;color:#3730a3;font-size:13px;font-weight:700;padding:3px 10px;border-radius:20px;">+30 pts</span></td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:11px 0;border-bottom:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td width="38"><div style="width:32px;height:32px;background:#f0f4ff;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">🚌</div></td>
                            <td style="padding-left:10px;">
                              <div style="font-size:14px;font-weight:600;color:#1f2937;">GT-001 · Premier trajet</div>
                              <div style="font-size:12px;color:#6b7280;">Effectuez votre premier covoiturage en tant que passager</div>
                            </td>
                            <td style="text-align:right;"><span style="background:#e0e7ff;color:#3730a3;font-size:13px;font-weight:700;padding:3px 10px;border-radius:20px;">+50 pts</span></td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:11px 0;border-bottom:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td width="38"><div style="width:32px;height:32px;background:#f0f4ff;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">⭐</div></td>
                            <td style="padding-left:10px;">
                              <div style="font-size:14px;font-weight:600;color:#1f2937;">GT-007 · Avis partagé</div>
                              <div style="font-size:12px;color:#6b7280;">Laissez votre premier avis après un trajet</div>
                            </td>
                            <td style="text-align:right;"><span style="background:#e0e7ff;color:#3730a3;font-size:13px;font-weight:700;padding:3px 10px;border-radius:20px;">+25 pts</span></td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:11px 0;border-bottom:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td width="38"><div style="width:32px;height:32px;background:#f0f4ff;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">📍</div></td>
                            <td style="padding-left:10px;">
                              <div style="font-size:14px;font-weight:600;color:#1f2937;">GT-008 · Lieu favori</div>
                              <div style="font-size:12px;color:#6b7280;">Enregistrez un lieu favori dans votre profil</div>
                            </td>
                            <td style="text-align:right;"><span style="background:#e0e7ff;color:#3730a3;font-size:13px;font-weight:700;padding:3px 10px;border-radius:20px;">+20 pts</span></td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:11px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td width="38"><div style="width:32px;height:32px;background:#f0f4ff;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">🚗</div></td>
                            <td style="padding-left:10px;">
                              <div style="font-size:14px;font-weight:600;color:#1f2937;">GT-002 · Conducteur débutant</div>
                              <div style="font-size:12px;color:#6b7280;">Publiez votre premier trajet en tant que conducteur</div>
                            </td>
                            <td style="text-align:right;"><span style="background:#e0e7ff;color:#3730a3;font-size:13px;font-weight:700;padding:3px 10px;border-radius:20px;">+75 pts</span></td>
                          </tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- SEPARATOR -->
                <tr><td style="padding:0 32px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>

                <!-- TIPS -->
                <tr>
                  <td style="padding:32px;">
                    <h3 style="margin:0 0 22px;color:#08316e;font-size:20px;font-weight:700;text-align:center;">
                      💡 Conseils pour bien démarrer
                    </h3>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="margin-bottom:16px;background:#f8faff;border-radius:10px;border-left:4px solid #08316e;">
                      <tr><td style="padding:16px 20px;">
                        <div style="font-size:15px;font-weight:700;color:#08316e;margin-bottom:6px;">⏰ Planifiez à l'avance</div>
                        <div style="font-size:14px;color:#4b5563;line-height:1.6;">
                          Publiez votre trajet <strong>24h à l'avance</strong> pour maximiser vos chances d'avoir des passagers.
                          Les conducteurs planifiés obtiennent en moyenne 3× plus de réservations et bâtissent
                          leur réputation plus rapidement.
                        </div>
                      </td></tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="margin-bottom:16px;background:#f0fdf4;border-radius:10px;border-left:4px solid #16a34a;">
                      <tr><td style="padding:16px 20px;">
                        <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:6px;">🕐 Soyez ponctuel</div>
                        <div style="font-size:14px;color:#4b5563;line-height:1.6;">
                          La ponctualité est la clé d'une bonne réputation. Votre <strong>GoScore</strong> en dépend directement.
                          Un conducteur noté 5 étoiles crée un cercle vertueux : plus de passagers, plus de GoPoints,
                          et plus d'accès aux fonctionnalités exclusives.
                        </div>
                      </td></tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="margin-bottom:16px;background:#fffbeb;border-radius:10px;border-left:4px solid #f59e0b;">
                      <tr><td style="padding:16px 20px;">
                        <div style="font-size:15px;font-weight:700;color:#92400e;margin-bottom:6px;">💬 Communiquez avant le départ</div>
                        <div style="font-size:14px;color:#4b5563;line-height:1.6;">
                          Utilisez la messagerie intégrée pour confirmer l'heure et le point de rendez-vous.
                          Un simple message avant le départ évite 90&nbsp;% des malentendus
                          et renforce la confiance dès la première rencontre.
                        </div>
                      </td></tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="background:#fdf4ff;border-radius:10px;border-left:4px solid #a855f7;">
                      <tr><td style="padding:16px 20px;">
                        <div style="font-size:15px;font-weight:700;color:#7e22ce;margin-bottom:6px;">🌿 Contribuez à un campus vert</div>
                        <div style="font-size:14px;color:#4b5563;line-height:1.6;">
                          Chaque trajet partagé, c'est du CO₂ en moins dans l'atmosphère.
                          Covoiturer avec 3 personnes équivaut à retirer une voiture de la route.
                          Votre impact est affiché sur votre profil pour que tout le monde puisse le voir.
                        </div>
                      </td></tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:0 32px 40px;text-align:center;">
                    <a href="{webUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#08316e,#1a5bb5);
                              color:#ffffff;font-size:17px;font-weight:700;text-decoration:none;
                              padding:16px 44px;border-radius:50px;letter-spacing:0.5px;">
                      Commencer à covoiturer →
                    </a>
                    <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">
                      Des questions ?
                      Consultez notre <a href="{webUrl}/faq" style="color:#2563eb;text-decoration:none;font-weight:600;">FAQ</a>
                      ou répondez directement à cet email.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#08316e;padding:24px 32px;text-align:center;">
                    <p style="margin:0 0 4px;color:#ffffff;font-size:13px;font-weight:600;">
                      Covoiturage La Cité
                    </p>
                    <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;">
                      Collège La Cité · 801 promenade de l'Aviation, Ottawa, ON K1K 4R3
                    </p>
                    <p style="margin:0;color:rgba(255,255,255,0.35);font-size:11px;">
                      Vous recevez cet email car vous venez de créer un compte sur notre plateforme.
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
