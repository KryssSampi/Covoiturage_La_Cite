using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Recalcule le GoScore de chaque utilisateur quotidiennement.
/// GoScore = f(rating, trips_completed, penalties, cancellations, co2_saved)
/// </summary>
public class GoScoreRecalcJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GoScoreRecalcJob> _logger;
    public GoScoreRecalcJob(IServiceScopeFactory scopeFactory, ILogger<GoScoreRecalcJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var users = await db.Users.Include(u => u.DriverProfile).ToListAsync();
        var updated = 0;

        foreach (var user in users)
        {
            // Formule simplifiée — à affiner avec pondération
            var tripsCompleted = await db.Reservations.CountAsync(r =>
                r.PassengerId == user.Id && r.Status == Domain.Enums.ReservationStatus.Completed);
            var tripsAsDriver = await db.Trips.CountAsync(t =>
                t.DriverId == user.Id && t.Status == Domain.Enums.TripStatus.Completed);
            var activePenalties = await db.Penalties.CountAsync(p =>
                p.UserId == user.Id && p.Status == Domain.Enums.PenaltyStatus.Active);
            var avgRating = user.DriverProfile?.AverageRating ?? 5.0m;

            var score = Math.Max(0, Math.Min(100,
                50
                + (tripsCompleted + tripsAsDriver) * 2
                - activePenalties * 10
                + (avgRating - 3m) * 10
            ));

            user.GoScore = (int)score;
            updated++;
        }

        await db.SaveChangesAsync();
        _logger.LogInformation("GoScoreRecalc: {Count} utilisateurs mis à jour", updated);
    }
}

/// <summary>
/// Envoie un rappel aux utilisateurs inactifs depuis 14 jours.
/// </summary>
public class InactiveUserReminderJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<InactiveUserReminderJob> _logger;
    public InactiveUserReminderJob(IServiceScopeFactory scopeFactory, ILogger<InactiveUserReminderJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTimeOffset.UtcNow.AddDays(-14);
        var inactive = await db.Users
            .Where(u => u.LastLoginAt < cutoff && u.Status == Domain.Enums.UserStatus.Active)
            .CountAsync();

        _logger.LogInformation("InactiveUserReminder: {Count} utilisateurs inactifs >14j identifiés", inactive);
        // TODO: Créer notification in-app pour chaque utilisateur
    }
}

/// <summary>
/// Vérifie les défis écologiques et marque les complétions.
/// </summary>
public class ChallengeProgressCheckJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ChallengeProgressCheckJob> _logger;
    public ChallengeProgressCheckJob(IServiceScopeFactory scopeFactory, ILogger<ChallengeProgressCheckJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTimeOffset.UtcNow;
        // Expire les défis terminés
        var expiredChallenges = await db.EcoChallenges
            .Where(c => c.ActiveUntil < now)
            .ToListAsync();

        // Vérifier les participations
        var participations = await db.ChallengeParticipations
            .Include(cp => cp.EcoChallenge)
            .Where(cp => !cp.IsCompleted && cp.EcoChallenge.ActiveUntil >= now)
            .ToListAsync();

        var completed = 0;
        foreach (var p in participations)
        {
            if (p.CurrentValue >= p.EcoChallenge.TargetValue)
            {
                p.IsCompleted = true;
                p.CompletedAt = now;
                completed++;
            }
        }

        if (completed > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("ChallengeProgressCheck: {Count} défis complétés", completed);
        }
    }
}

/// <summary>
/// Traite les demandes de retrait en attente.
/// </summary>
public class WithdrawalProcessingJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WithdrawalProcessingJob> _logger;
    public WithdrawalProcessingJob(IServiceScopeFactory scopeFactory, ILogger<WithdrawalProcessingJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var pending = await db.Withdrawals
            .Where(w => w.Status == "Pending")
            .ToListAsync();

        foreach (var w in pending)
        {
            w.Status = "Processing";
            // TODO: Intégrer Interac/Stripe pour le transfert réel
        }

        if (pending.Count > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("WithdrawalProcessing: {Count} retraits en traitement", pending.Count);
        }
    }
}

/// <summary>
/// Génère le rapport hebdomadaire de la plateforme.
/// </summary>
public class WeeklyReportJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WeeklyReportJob> _logger;
    public WeeklyReportJob(IServiceScopeFactory scopeFactory, ILogger<WeeklyReportJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var weekAgo = DateTimeOffset.UtcNow.AddDays(-7);
        var newUsers = await db.Users.CountAsync(u => u.CreatedAt >= weekAgo);
        var tripsCompleted = await db.Trips.CountAsync(t => t.Status == Domain.Enums.TripStatus.Completed && t.ActualCompletedAt >= weekAgo);
        var revenue = await db.Transactions.Where(t => t.CreatedAt >= weekAgo).SumAsync(t => t.PlatformFee);

        _logger.LogInformation("WeeklyReport: {NewUsers} nouveaux users, {Trips} trajets, {Revenue}$ revenus",
            newUsers, tripsCompleted, revenue);
    }
}

/// <summary>
/// Supprime (soft-delete) les comptes inactifs depuis plus de 6 mois.
///
/// Couche de non-répudiation : le compte est marqué Deleted (DeletedAt + Status),
/// mais n'est PAS physiquement supprimé. Si l'utilisateur revient avec le même email
/// institutionnel, la preuve d'appartenance (@collegelacite.ca) est retrouvée.
///
/// Exclusions : admins, comptes déjà supprimés ou bannis, comptes PendingVerification récents.
/// </summary>
public class AccountLifecycleJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AccountLifecycleJob> _logger;

    public AccountLifecycleJob(IServiceScopeFactory scopeFactory, ILogger<AccountLifecycleJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTimeOffset.UtcNow.AddMonths(-6);

        var inactiveUsers = await db.Users
            .Where(u =>
                u.Status == Domain.Enums.UserStatus.Active &&
                u.Role != Domain.Enums.UserRole.Admin &&
                (
                    (u.LastLoginAt != null && u.LastLoginAt < cutoff) ||
                    (u.LastLoginAt == null && u.CreatedAt < cutoff)
                )
            )
            .ToListAsync();

        if (inactiveUsers.Count == 0)
        {
            _logger.LogDebug("AccountLifecycle: aucun compte inactif à supprimer");
            return;
        }

        var now = DateTimeOffset.UtcNow;
        foreach (var user in inactiveUsers)
        {
            user.DeletedAt = now;
            user.Status = Domain.Enums.UserStatus.Deleted;
            user.UpdatedAt = now;
        }

        await db.SaveChangesAsync();
        _logger.LogInformation("AccountLifecycle: {Count} comptes inactifs (>6 mois) supprimés", inactiveUsers.Count);
    }
}

/// <summary>
/// Vérifie et attribue automatiquement les badges aux utilisateurs.
/// </summary>
public class BadgeAwardCheckJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BadgeAwardCheckJob> _logger;
    public BadgeAwardCheckJob(IServiceScopeFactory scopeFactory, ILogger<BadgeAwardCheckJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var badges = await db.Badges.Where(b => b.IsActive).ToListAsync();
        var awarded = 0;

        // Exemple: badge "Premier Trajet"
        var firstTripBadge = badges.FirstOrDefault(b => b.Name == "Premier Trajet");
        if (firstTripBadge != null)
        {
            var usersWithTrips = await db.Trips
                .Where(t => t.Status == Domain.Enums.TripStatus.Completed)
                .Select(t => t.DriverId)
                .Distinct()
                .ToListAsync();

            foreach (var userId in usersWithTrips)
            {
                var hasBadge = await db.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == firstTripBadge.Id);
                if (!hasBadge)
                {
                    db.UserBadges.Add(new Domain.Entities.UserBadge
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        BadgeId = firstTripBadge.Id,
                        AwardedAt = DateTimeOffset.UtcNow
                    });
                    awarded++;
                }
            }
        }

        if (awarded > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("BadgeAwardCheck: {Count} badges attribués", awarded);
        }
    }
}

/// <summary>
/// Réinitialise DisabledOtp à false pour les utilisateurs dont les 30 jours sont expirés.
/// Tourne quotidiennement à 5h du matin.
/// </summary>
public class OtpExpiryJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OtpExpiryJob> _logger;
    public OtpExpiryJob(IServiceScopeFactory scopeFactory, ILogger<OtpExpiryJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTimeOffset.UtcNow.AddDays(-30);
        var expired = await db.Users
            .Where(u => u.DisabledOtp && u.DisabledOtpAt.HasValue && u.DisabledOtpAt.Value < cutoff)
            .ToListAsync();

        if (expired.Count == 0) return;

        foreach (var user in expired)
        {
            user.DisabledOtp = false;
            user.DisabledOtpAt = null;
            user.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync();
        _logger.LogInformation("OtpExpiryJob: {Count} comptes remis en 2FA OTP", expired.Count);
    }
}
