namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

/// <summary>
/// BackgroundService qui purge les codes OTP expirés toutes les 30 secondes.
/// Indépendant de Hangfire (qui a un minimum de 1 minute).
/// </summary>
public class SessionCodeCleanupService : BackgroundService
{
    private readonly SessionCodeService _sessionCodeService;
    private readonly ILogger<SessionCodeCleanupService> _logger;
    private static readonly TimeSpan _interval = TimeSpan.FromSeconds(30);

    public SessionCodeCleanupService(SessionCodeService sessionCodeService, ILogger<SessionCodeCleanupService> logger)
    {
        _sessionCodeService = sessionCodeService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SessionCodeCleanupService démarré (intervalle: 30s)");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_interval, stoppingToken);

            try
            {
                _sessionCodeService.PurgeExpired();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la purge des codes OTP");
            }
        }
    }
}
