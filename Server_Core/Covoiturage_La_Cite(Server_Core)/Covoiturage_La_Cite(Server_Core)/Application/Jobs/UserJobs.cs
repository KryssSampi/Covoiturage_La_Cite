using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Recalcule le GoScore de chaque utilisateur quotidiennement.
/// GoScore = f(rating, trips_completed, penalties, cancellations, co2_saved)
/// </summary>
public class GoScoreRecalcJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<GoScoreRecalcJob> _logger;
    public GoScoreRecalcJob(AppDbContext db, ILogger<GoScoreRecalcJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var users = await _db.Users.Include(u => u.DriverProfile).ToListAsync();
        var updated = 0;

        foreach (var user in users)
        {
            // Formule simplifiée — à affiner avec pondération
            var tripsCompleted = await _db.Reservations.CountAsync(r =>
                r.PassengerId == user.Id && r.Status == Domain.Enums.ReservationStatus.Completed);
            var tripsAsDriver = await _db.Trips.CountAsync(t =>
                t.DriverId == user.Id && t.Status == Domain.Enums.TripStatus.Completed);
            var activePenalties = await _db.Penalties.CountAsync(p =>
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

        await _db.SaveChangesAsync();
        _logger.LogInformation("GoScoreRecalc: {Count} utilisateurs mis à jour", updated);
    }
}

/// <summary>
/// Envoie un rappel aux utilisateurs inactifs depuis 14 jours.
/// </summary>
public class InactiveUserReminderJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<InactiveUserReminderJob> _logger;
    public InactiveUserReminderJob(AppDbContext db, ILogger<InactiveUserReminderJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-14);
        var inactive = await _db.Users
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
    private readonly AppDbContext _db;
    private readonly ILogger<ChallengeProgressCheckJob> _logger;
    public ChallengeProgressCheckJob(AppDbContext db, ILogger<ChallengeProgressCheckJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var now = DateTimeOffset.UtcNow;
        // Expire les défis terminés
        var expiredChallenges = await _db.EcoChallenges
            .Where(c => c.ActiveUntil < now)
            .ToListAsync();

        // Vérifier les participations
        var participations = await _db.ChallengeParticipations
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
            await _db.SaveChangesAsync();
            _logger.LogInformation("ChallengeProgressCheck: {Count} défis complétés", completed);
        }
    }
}

/// <summary>
/// Traite les demandes de retrait en attente.
/// </summary>
public class WithdrawalProcessingJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<WithdrawalProcessingJob> _logger;
    public WithdrawalProcessingJob(AppDbContext db, ILogger<WithdrawalProcessingJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var pending = await _db.Withdrawals
            .Where(w => w.Status == "Pending")
            .ToListAsync();

        foreach (var w in pending)
        {
            w.Status = "Processing";
            // TODO: Intégrer Interac/Stripe pour le transfert réel
        }

        if (pending.Count > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("WithdrawalProcessing: {Count} retraits en traitement", pending.Count);
        }
    }
}

/// <summary>
/// Génère le rapport hebdomadaire de la plateforme.
/// </summary>
public class WeeklyReportJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<WeeklyReportJob> _logger;
    public WeeklyReportJob(AppDbContext db, ILogger<WeeklyReportJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var weekAgo = DateTimeOffset.UtcNow.AddDays(-7);
        var newUsers = await _db.Users.CountAsync(u => u.CreatedAt >= weekAgo);
        var tripsCompleted = await _db.Trips.CountAsync(t => t.Status == Domain.Enums.TripStatus.Completed && t.ActualCompletedAt >= weekAgo);
        var revenue = await _db.Transactions.Where(t => t.CreatedAt >= weekAgo).SumAsync(t => t.PlatformFee);

        _logger.LogInformation("WeeklyReport: {NewUsers} nouveaux users, {Trips} trajets, {Revenue}$ revenus",
            newUsers, tripsCompleted, revenue);
    }
}

/// <summary>
/// Vérifie et attribue automatiquement les badges aux utilisateurs.
/// </summary>
public class BadgeAwardCheckJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<BadgeAwardCheckJob> _logger;
    public BadgeAwardCheckJob(AppDbContext db, ILogger<BadgeAwardCheckJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var badges = await _db.Badges.Where(b => b.IsActive).ToListAsync();
        var awarded = 0;

        // Exemple: badge "Premier Trajet"
        var firstTripBadge = badges.FirstOrDefault(b => b.Name == "Premier Trajet");
        if (firstTripBadge != null)
        {
            var usersWithTrips = await _db.Trips
                .Where(t => t.Status == Domain.Enums.TripStatus.Completed)
                .Select(t => t.DriverId)
                .Distinct()
                .ToListAsync();

            foreach (var userId in usersWithTrips)
            {
                var hasBadge = await _db.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == firstTripBadge.Id);
                if (!hasBadge)
                {
                    _db.UserBadges.Add(new Domain.Entities.UserBadge
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
            await _db.SaveChangesAsync();
            _logger.LogInformation("BadgeAwardCheck: {Count} badges attribués", awarded);
        }
    }
}
