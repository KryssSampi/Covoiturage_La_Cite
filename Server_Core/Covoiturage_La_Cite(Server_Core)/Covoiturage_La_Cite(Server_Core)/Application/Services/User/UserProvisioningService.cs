using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using NotificationEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.Notification;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.User;

/// <summary>
/// Provisionne toutes les entités satellites d'un nouveau compte utilisateur :
///   • UserPreferences (valeurs par défaut)
///   • UserStat (compteurs à zéro)
///   • UserBehaviorPattern (placeholder vide)
///   • GT-000 "Bienvenue" auto-complété (+250 GoPoints sur l'utilisateur)
///   • Badge "Nouveau membre" auto-attribué
///   • Notification de bienvenue
/// Toutes les opérations sont idempotentes.
/// </summary>
public class UserProvisioningService : IUserProvisioningService
{
    // GUIDs stables — doivent correspondre aux seeds dans DatabaseSeeder
    private static readonly Guid GoTaskWelcomeId    = Guid.Parse("A0000000-0000-0000-0000-000000000000");
    private static readonly Guid BadgeNewMemberId   = Guid.Parse("60000000-0000-0000-0000-000000000003");
    private const int WelcomePoints = 250;

    private readonly AppDbContext _db;
    private readonly ILogger<UserProvisioningService> _logger;

    public UserProvisioningService(AppDbContext db, ILogger<UserProvisioningService> logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task ProvisionAsync(Guid userId, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;

        // ── 1. UserPreferences ────────────────────────────────────────────────
        var hasPrefs = await _db.UserPreferences.AnyAsync(p => p.UserId == userId, ct);
        if (!hasPrefs)
        {
            _db.UserPreferences.Add(new UserPreferences
            {
                Id                 = Guid.NewGuid(),
                UserId             = userId,
                MusicAccepted      = true,
                HasPets            = false,
                SmokesRegularly    = false,
                TypicalBaggage     = false,
                ConversationLevel  = ConversationLevel.Moderate,
                EmailNotifications = true,
                PushNotifications  = true,
                Language           = "fr",
            });
        }

        // ── 2. UserStat ───────────────────────────────────────────────────────
        var hasStats = await _db.UserStats.AnyAsync(s => s.UserId == userId, ct);
        if (!hasStats)
        {
            _db.UserStats.Add(new UserStat
            {
                Id             = Guid.NewGuid(),
                UserId         = userId,
                RecomputedAt   = now,
            });
        }

        // ── 3. UserBehaviorPattern (placeholder) ──────────────────────────────
        var hasPattern = await _db.UserBehaviorPatterns.AnyAsync(p => p.UserId == userId, ct);
        if (!hasPattern)
        {
            _db.UserBehaviorPatterns.Add(new UserBehaviorPattern
            {
                Id                  = Guid.NewGuid(),
                UserId              = userId,
                TypicalDepartureDays = [],
                AvgSessionsPerWeek  = 0m,
                ChurnRisk           = ChurnRisk.Low,
                PatternConfidence   = 0m,
                RecomputedAt        = now,
            });
        }

        // ── 4. GT-000 "Bienvenue" — auto-complétion ───────────────────────────
        var alreadyCompleted = await _db.Set<UserGoTaskProgression>()
            .AnyAsync(p => p.UserId == userId && p.GoTaskId == GoTaskWelcomeId, ct);

        if (!alreadyCompleted)
        {
            var taskExists = await _db.GoTasks.AnyAsync(t => t.Id == GoTaskWelcomeId, ct);
            if (taskExists)
            {
                _db.Set<UserGoTaskProgression>().Add(new UserGoTaskProgression
                {
                    Id        = Guid.NewGuid(),
                    UserId    = userId,
                    GoTaskId  = GoTaskWelcomeId,
                    IsDone    = true,
                    CompletedAt = now,
                });

                // Créditer les points directement sur l'utilisateur
                var user = await _db.Users.FindAsync([userId], ct);
                if (user != null)
                {
                    user.GoScore  += WelcomePoints;
                    user.UpdatedAt = now;
                }

                // Notification GoTask complété
                _db.Notifications.Add(new NotificationEntity
                {
                    Id         = Guid.NewGuid(),
                    UserId     = userId,
                    Type       = NotificationType.GoTaskCompleted,
                    Title      = "Bienvenue sur Covoiturage La Cité ! 🎉",
                    Body       = $"Vous avez gagné {WelcomePoints} GoPoints en rejoignant la communauté.",
                    IsImportant = true,
                    DeepLink   = "/driver/{id}/goboard",
                    CreatedAt  = now,
                });
            }
            else
            {
                _logger.LogWarning("UserProvisioningService: GT-000 introuvable — seeder pas encore exécuté?");
            }
        }

        // ── 5. Badge "Nouveau membre" ─────────────────────────────────────────
        var alreadyHasBadge = await _db.UserBadges
            .AnyAsync(b => b.UserId == userId && b.BadgeId == BadgeNewMemberId, ct);

        if (!alreadyHasBadge)
        {
            var badgeExists = await _db.Badges.AnyAsync(b => b.Id == BadgeNewMemberId, ct);
            if (badgeExists)
            {
                _db.UserBadges.Add(new UserBadge
                {
                    Id        = Guid.NewGuid(),
                    UserId    = userId,
                    BadgeId   = BadgeNewMemberId,
                    AwardedAt = now,
                });

                _db.Notifications.Add(new NotificationEntity
                {
                    Id          = Guid.NewGuid(),
                    UserId      = userId,
                    Type        = NotificationType.BadgeEarned,
                    Title       = "Badge obtenu : Nouveau membre",
                    Body        = "Bienvenue dans la communauté Covoiturage La Cité !",
                    IsImportant = false,
                    CreatedAt   = now,
                });
            }
            else
            {
                _logger.LogWarning("UserProvisioningService: badge 'Nouveau membre' introuvable — seeder pas encore exécuté?");
            }
        }

        // ── 6. Notification de bienvenue ──────────────────────────────────────
        var hasWelcome = await _db.Notifications
            .AnyAsync(n => n.UserId == userId && n.Type == NotificationType.Welcome, ct);
        if (!hasWelcome)
        {
            _db.Notifications.Add(new NotificationEntity
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Type        = NotificationType.Welcome,
                Title       = "Bienvenue sur Covoiturage La Cité !",
                Body        = "Découvrez comment fonctionne la plateforme et commencez à covoiturer.",
                IsImportant = true,
                DeepLink    = "/onboarding",
                CreatedAt   = now,
            });
        }

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("UserProvisioningService: provisionnement complet pour {UserId}", userId);
    }
}
