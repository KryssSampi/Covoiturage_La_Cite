using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
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

        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();
        var now = DateTimeOffset.UtcNow;
        var cutoff = now.AddDays(-14);
        var inactive = await db.Users
            .Where(u => u.LastLoginAt < cutoff && u.Status == Domain.Enums.UserStatus.Active)
            .ToListAsync();

        foreach (var user in inactive)
        {
            var alreadySent = await db.Notifications.AnyAsync(n =>
                n.UserId == user.Id &&
                n.Type == NotificationType.Suggestion &&
                n.CreatedAt >= now.AddDays(-7));
            if (alreadySent) continue;

            try
            {
                await notifications.CreateAsync(new CreateNotificationDto
                {
                    UserId = user.Id,
                    Type = NotificationType.Suggestion,
                    Title = "On vous attend sur Covoiturage La Cite",
                    Body = "De nouveaux trajets sont disponibles. Revenez trouver votre prochain covoiturage en quelques secondes.",
                    IsImportant = false,
                    DeepLink = "/search"
                });
            }
            catch { }
        }

        _logger.LogInformation("InactiveUserReminder: {Count} utilisateurs inactifs >14j identifies", inactive.Count);
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
                p.UpdatedAt = now;
                completed++;
            }
        }

        if (completed == 0) return;

        await db.SaveChangesAsync();

        var completedNow = participations.Where(p => p.IsCompleted && !p.RewardClaimed).ToList();
        foreach (var p in completedNow)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == p.UserId);
            if (user == null) continue;

            user.GoScore += p.EcoChallenge.RewardPoints;
            p.RewardClaimed = true;
            p.UpdatedAt = now;

            if (p.EcoChallenge.RewardBadgeId.HasValue)
            {
                var hasBadge = await db.UserBadges.AnyAsync(ub =>
                    ub.UserId == p.UserId && ub.BadgeId == p.EcoChallenge.RewardBadgeId.Value);
                if (!hasBadge)
                {
                    db.UserBadges.Add(new Domain.Entities.UserBadge
                    {
                        Id = Guid.NewGuid(),
                        UserId = p.UserId,
                        BadgeId = p.EcoChallenge.RewardBadgeId.Value,
                        AwardedAt = now
                    });
                }
            }

            db.Notifications.Add(new Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                UserId = p.UserId,
                Type = NotificationType.ChallengeCompleted,
                Title = "Defi complete",
                Body = $"Bravo! Vous avez complete le defi '{p.EcoChallenge.Title}' et gagne {p.EcoChallenge.RewardPoints} points.",
                IsImportant = false,
                IsRead = false,
                DeepLink = "/goboard",
                CreatedAt = now
            });
        }

        await db.SaveChangesAsync();
        _logger.LogInformation("ChallengeProgressCheck: {Count} defis completes et recompenses attribuees", completed);
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
            .Include(w => w.DriverProfile)
            .ToListAsync();

        var now = DateTimeOffset.UtcNow;
        foreach (var w in pending)
        {
            if (w.DriverProfile.BalanceAvailable >= w.Amount)
            {
                w.DriverProfile.BalanceAvailable -= w.Amount;
                w.Status = "Completed";
                w.ProcessedAt = now;
                w.CompletedAt = now;
                w.ExternalReference = $"SIM-{now:yyyyMMddHHmmss}-{w.Id.ToString()[..8]}";

                db.Notifications.Add(new Domain.Entities.Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = w.DriverProfile.UserId,
                    Type = NotificationType.PaymentProcessed,
                    Title = "Retrait traite",
                    Body = $"Votre retrait de {w.Amount:0.00}$ a ete traite.",
                    IsImportant = true,
                    IsRead = false,
                    DeepLink = "/finance/withdrawals",
                    CreatedAt = now
                });
            }
            else
            {
                w.Status = "Rejected";
                w.ProcessedAt = now;
                w.RejectionReason = "Solde insuffisant au moment du traitement";

                db.Notifications.Add(new Domain.Entities.Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = w.DriverProfile.UserId,
                    Type = NotificationType.SystemAlert,
                    Title = "Retrait refuse",
                    Body = $"Votre retrait de {w.Amount:0.00}$ a ete refuse (solde insuffisant).",
                    IsImportant = true,
                    IsRead = false,
                    DeepLink = "/finance/withdrawals",
                    CreatedAt = now
                });
            }
        }

        if (pending.Count > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("WithdrawalProcessing: {Count} retraits traites", pending.Count);
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
                    db.Notifications.Add(new Domain.Entities.Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Type = NotificationType.BadgeEarned,
                        Title = "Nouveau badge obtenu",
                        Body = $"Felicitations! Vous avez obtenu le badge '{firstTripBadge.Name}'.",
                        IsImportant = false,
                        IsRead = false,
                        DeepLink = "/goboard",
                        CreatedAt = DateTimeOffset.UtcNow
                    });
                    awarded++;
                }
            }
        }

        if (awarded > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("BadgeAwardCheck: {Count} badges attribues", awarded);
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
