using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gamification;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;
using UserEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.User;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Gamification;

public class GoTaskService : IGoTaskService
{
    private readonly IGoTaskRepository _taskRepo;
    private readonly IUserGoTaskProgressionRepository _progRepo;
    private readonly IUserRepository _userRepo;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _db;
    private readonly ILogger<GoTaskService> _logger;

    public GoTaskService(
        IGoTaskRepository taskRepo,
        IUserGoTaskProgressionRepository progRepo,
        IUserRepository userRepo,
        INotificationService notificationService,
        AppDbContext db,
        ILogger<GoTaskService> logger)
    {
        _taskRepo = taskRepo;
        _progRepo = progRepo;
        _userRepo = userRepo;
        _notificationService = notificationService;
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<GoTaskResponseDto>> GetAllWithProgressionAsync(Guid userId, CancellationToken ct = default)
    {
        var tasks = await _taskRepo.GetWithUserProgressionAsync(userId, ct);
        return tasks.Select(t =>
        {
            var prog = t.Progressions.FirstOrDefault(p => p.UserId == userId);
            return new GoTaskResponseDto
            {
                Id = t.Id,
                TaskKey = t.TaskKey,
                TitleFr = t.TitleFr,
                TitleEn = t.TitleEn,
                DescriptionFr = t.DescriptionFr,
                DescriptionEn = t.DescriptionEn,
                Category = t.Category,
                Link = t.Link,
                Points = t.Points,
                IsCompleted = prog?.IsDone ?? false,
                CompletedAt = prog?.CompletedAt
            };
        });
    }

    public async Task<bool> TryCompleteAsync(Guid userId, string taskKey, CancellationToken ct = default)
    {
        var task = await _taskRepo.GetByKeyAsync(taskKey, ct);
        if (task == null || !task.IsActive)
            return false;

        // Idempotent : déjà complétée ?
        var existing = await _progRepo.GetByUserAndTaskAsync(userId, task.Id, ct);
        if (existing?.IsDone == true)
            return false;

        // Créer ou mettre à jour la progression
        if (existing == null)
        {
            await _progRepo.AddAsync(new UserGoTaskProgression
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoTaskId = task.Id,
                IsDone = true,
                CompletedAt = DateTimeOffset.UtcNow
            }, ct);
        }
        else
        {
            existing.IsDone = true;
            existing.CompletedAt = DateTimeOffset.UtcNow;
            await _progRepo.UpdateAsync(existing, ct);
        }

        // Attribuer les GoPoints
        var user = await _userRepo.GetWithProfileAsync(userId, ct);
        if (user != null)
        {
            user.GoScore += task.Points;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _userRepo.UpdateAsync(user, ct);

            // Vérifier jalons GoScore (GT-008 = 500pts, GT-009 = 1000pts)
            await CheckGoScoreMilestonesAsync(user, ct);
        }

        _logger.LogInformation("GoTask {TaskKey} complétée par {UserId} (+{Points} pts)", taskKey, userId, task.Points);

        // Notification de complétion
        await _notificationService.CreateAsync(new CreateNotificationDto
        {
            UserId = userId,
            Type = NotificationType.GoTaskCompleted,
            Title = $"GoTask accomplie ! +{task.Points} points",
            Body = $"Bravo ! Vous avez accompli « {task.TitleFr} » et gagné {task.Points} GoPoints.",
            IsImportant = false,
            DeepLink = "/goboard"
        }, ct);

        return true;
    }

    // ── GoBoard ──────────────────────────────────────────────────────────────

    public async Task<GoBoardResponseDto> GetGoBoardAsync(Guid userId, CancellationToken ct = default)
    {
        // Séquentiel — Task.WhenAll interdit sur un même DbContext (concurrence EF Core)
        var user         = await _userRepo.GetWithProfileAsync(userId, ct);
        var goTasks      = await GetAllWithProgressionAsync(userId, ct);
        var topUsers     = await _userRepo.GetTopByGoScoreAsync(50, ct);
        var myChallenges = await _db.ChallengeParticipations
            .Include(p => p.EcoChallenge)
            .Where(p => p.UserId == userId)
            .ToListAsync(ct);

        var goScore = user?.GoScore ?? 0;
        var tier    = ScoreTier(goScore);

        // Classement
        var sorted = topUsers.ToList();
        var classement = sorted.Select((u, idx) => new ClassementEntryDto
        {
            Rang           = idx + 1,
            UtilisateurId  = u.Id,
            Nom            = $"{u.FirstName} {u.LastName}",
            Score          = u.GoScore,
            EstMoi         = u.Id == userId
        }).ToList();

        var rang = classement.FirstOrDefault(e => e.EstMoi)?.Rang ?? classement.Count + 1;

        // Points gagnés = somme des points des GoTasks complétées
        var pointsGagnes = goTasks.Where(t => t.IsCompleted).Sum(t => t.Points);

        // Défis éco avec progression
        var defisEco = myChallenges.Select(p =>
        {
            var progPct = p.EcoChallenge is null ? 0
                : (int)Math.Min(Math.Round((double)p.CurrentValue / (double)p.EcoChallenge.TargetValue * 100), 100);

            var statut = p.IsCompleted ? "complete"
                : progPct >= 10 ? "actif"
                : "verrouille";

            return new EcoChallengeAvecProgressionDto
            {
                Id           = p.EcoChallengeId,
                Title        = p.EcoChallenge?.Title ?? string.Empty,
                TitleEn      = p.EcoChallenge?.TitleEn ?? string.Empty,
                MetricType   = p.EcoChallenge?.MetricType ?? string.Empty,
                TargetValue  = p.EcoChallenge?.TargetValue ?? 0,
                RewardPoints = p.EcoChallenge?.RewardPoints ?? 0,
                Progres      = progPct,
                Statut       = statut
            };
        }).ToList();

        return new GoBoardResponseDto
        {
            GoScore      = goScore,
            Tier         = tier,
            Rang         = rang,
            PointsGagnes = pointsGagnes,
            GoTasks      = goTasks,
            Classement   = classement,
            DefisEco     = defisEco
        };
    }

    private static string ScoreTier(int score) => score switch
    {
        >= 800 => "Excellent",
        >= 600 => "Bon",
        >= 400 => "Passable",
        _      => "Restreint"
    };

    // ── Jalons GoScore ───────────────────────────────────────────────────────

    private static readonly IReadOnlyList<(int Threshold, string TaskKey, string Label)> ScoreMilestones =
    [
        (500,  "GT-008", "500"),
        (1000, "GT-009", "1 000"),
    ];

    private async Task CheckGoScoreMilestonesAsync(UserEntity user, CancellationToken ct)
    {
        foreach (var (threshold, key, label) in ScoreMilestones)
        {
            if (user.GoScore < threshold) continue;

            var task = await _taskRepo.GetByKeyAsync(key, ct);
            if (task == null) continue;

            var prog = await _progRepo.GetByUserAndTaskAsync(user.Id, task.Id, ct);
            if (prog?.IsDone == true) continue;

            if (prog == null)
                await _progRepo.AddAsync(new UserGoTaskProgression
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    GoTaskId = task.Id,
                    IsDone = true,
                    CompletedAt = DateTimeOffset.UtcNow
                }, ct);
            else
            {
                prog.IsDone = true;
                prog.CompletedAt = DateTimeOffset.UtcNow;
                await _progRepo.UpdateAsync(prog, ct);
            }

            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = user.Id,
                Type = NotificationType.GoScoreMilestone,
                Title = $"Jalon atteint : {label} GoPoints !",
                Body = $"Félicitations ! Vous avez franchi le cap des {label} GoPoints. Continuez comme ça !",
                IsImportant = false,
                DeepLink = "/goboard"
            }, ct);
        }
    }
}
