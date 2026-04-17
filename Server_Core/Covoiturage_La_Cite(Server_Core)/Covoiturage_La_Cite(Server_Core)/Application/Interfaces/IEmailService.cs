namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IEmailService
{
    Task SendOtpAsync(string toEmail, string otpCode, CancellationToken ct = default);

    /// <summary>
    /// Envoie un email de notification à l'utilisateur.
    /// Appelé automatiquement par NotificationService selon les préférences par catégorie.
    /// </summary>
    Task SendNotificationEmailAsync(
        string toEmail,
        string firstName,
        string notificationTitle,
        string notificationBody,
        string? deepLink,
        CancellationToken ct = default);

    /// <summary>
    /// Envoie l'email de bienvenue complet à un nouvel utilisateur.
    /// Contient : message de bienvenue, récompenses initiales, comment ça marche, GoTasks, conseils.
    /// </summary>
    Task SendWelcomeEmailAsync(string toEmail, string firstName, CancellationToken ct = default);
}
