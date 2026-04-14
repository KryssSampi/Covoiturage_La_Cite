using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

/// <summary>
/// BackgroundService qui purge les AuthSessions expirées toutes les 30 secondes.
/// </summary>
public class AuthSessionCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuthSessionCleanupService> _logger;
    private static readonly TimeSpan _interval = TimeSpan.FromSeconds(30);

    public AuthSessionCleanupService(IServiceScopeFactory scopeFactory, ILogger<AuthSessionCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AuthSessionCleanupService démarré (intervalle: 30s)");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_interval, stoppingToken);

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<IAuthSessionRepository>();
                await repo.DeleteExpiredAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la purge des AuthSessions");
            }
        }
    }
}
