using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Social;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Social;

// ── ReviewService ────────────────────────────────────────────────────────────

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repo;
    private readonly IGoTaskService _goTasks;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(IReviewRepository repo, IGoTaskService goTasks, ILogger<ReviewService> logger)
    { _repo = repo; _goTasks = goTasks; _logger = logger; }

    public async Task<ReviewResponseDto> CreateAsync(Guid reviewerId, CreateReviewDto dto, CancellationToken ct = default)
    {
        // Vérifier qu'on n'a pas déjà laissé un avis sur cette réservation
        var existing = await _repo.GetByReservationAndReviewerAsync(dto.ReservationId, reviewerId, ct);
        if (existing != null)
            throw new InvalidOperationException("Vous avez déjà laissé un avis pour cette réservation");

        if (dto.Rating is < 1 or > 5)
            throw new ArgumentException("La note doit être entre 1 et 5");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            TripId = dto.TripId,
            ReservationId = dto.ReservationId,
            ReviewerId = reviewerId,
            RevieweeId = dto.RevieweeId,
            RevieweeRole = UserRole.Passenger, // sera ajusté selon le contexte
            Rating = dto.Rating,
            Comment = dto.Comment,
            Tags = dto.Tags,
            IsPublished = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repo.AddAsync(review, ct);
        _logger.LogInformation("Avis créé: {ReviewId} par {ReviewerId} pour {RevieweeId}", review.Id, reviewerId, dto.RevieweeId);
        // GoTask trigger — GT-006 : premier avis laissé
        _ = Task.Run(() => _goTasks.TryCompleteAsync(reviewerId, "GT-006", ct), ct);
        return MapReview(review);
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetReceivedReviewsAsync(Guid userId, CancellationToken ct = default)
    {
        var reviews = await _repo.GetByRevieweeIdAsync(userId, ct);
        return reviews.Select(MapReview);
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetGivenReviewsAsync(Guid userId, CancellationToken ct = default)
    {
        var reviews = await _repo.GetByReviewerIdAsync(userId, ct);
        return reviews.Select(MapReview);
    }

    public async Task<double> GetAverageRatingAsync(Guid userId, CancellationToken ct = default)
        => await _repo.GetAverageRatingAsync(userId, ct);

    private static ReviewResponseDto MapReview(Review r) => new()
    {
        Id = r.Id, TripId = r.TripId, ReservationId = r.ReservationId,
        ReviewerId = r.ReviewerId, RevieweeId = r.RevieweeId,
        RevieweeRole = r.RevieweeRole.ToString(), Rating = r.Rating,
        Comment = r.Comment, Tags = r.Tags, IsPublished = r.IsPublished,
        CreatedAt = r.CreatedAt
    };
}

// ── AffinityService ──────────────────────────────────────────────────────────

public class AffinityService : IAffinityService
{
    private readonly IAffinityRepository _repo;

    public AffinityService(IAffinityRepository repo) => _repo = repo;

    public async Task<IEnumerable<AffinityResponseDto>> GetFavoritesAsync(Guid userId, CancellationToken ct = default)
    {
        var favs = await _repo.GetFavoritesAsync(userId, ct);
        return favs.Select(MapAffinity);
    }

    public async Task<AffinityResponseDto> ToggleFavoriteAsync(Guid userId, Guid targetUserId, CancellationToken ct = default)
    {
        var affinity = await _repo.GetByUserPairAsync(userId, targetUserId, ct);
        if (affinity == null)
        {
            affinity = new Affinity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TargetUserId = targetUserId,
                IsActuallyFavorite = true,
                FavoriteSince = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            await _repo.AddAsync(affinity, ct);
        }
        else
        {
            affinity.IsActuallyFavorite = !affinity.IsActuallyFavorite;
            affinity.FavoriteSince = affinity.IsActuallyFavorite ? DateTimeOffset.UtcNow : null;
            affinity.UpdatedAt = DateTimeOffset.UtcNow;
            await _repo.UpdateAsync(affinity, ct);
        }
        return MapAffinity(affinity);
    }

    public async Task<AffinityResponseDto> BlockUserAsync(Guid userId, Guid targetUserId, CancellationToken ct = default)
    {
        var affinity = await _repo.GetByUserPairAsync(userId, targetUserId, ct);
        if (affinity == null)
        {
            affinity = new Affinity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TargetUserId = targetUserId,
                IsBlocked = true,
                IsActuallyFavorite = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            await _repo.AddAsync(affinity, ct);
        }
        else
        {
            affinity.IsBlocked = true;
            affinity.IsActuallyFavorite = false;
            affinity.UpdatedAt = DateTimeOffset.UtcNow;
            await _repo.UpdateAsync(affinity, ct);
        }
        return MapAffinity(affinity);
    }

    public async Task<AffinityResponseDto> UnblockUserAsync(Guid userId, Guid targetUserId, CancellationToken ct = default)
    {
        var affinity = await _repo.GetByUserPairAsync(userId, targetUserId, ct)
            ?? throw new KeyNotFoundException("Aucune relation trouvée");
        affinity.IsBlocked = false;
        affinity.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(affinity, ct);
        return MapAffinity(affinity);
    }

    public async Task<IEnumerable<AffinityResponseDto>> GetTopAffinitiesAsync(Guid userId, int top = 10, CancellationToken ct = default)
    {
        var affinities = await _repo.GetTopAffinitiesAsync(userId, top, ct);
        return affinities.Select(MapAffinity);
    }

    private static AffinityResponseDto MapAffinity(Affinity a) => new()
    {
        Id = a.Id, UserId = a.UserId, TargetUserId = a.TargetUserId,
        AffinityScore = a.AffinityScore, IsActuallyFavorite = a.IsActuallyFavorite,
        FavoriteSince = a.FavoriteSince, TotalTripsTogether = a.TotalTripsTogether,
        AvgRatingGiven = a.AvgRatingGiven, IsBlocked = a.IsBlocked,
        CreatedAt = a.CreatedAt
    };
}

// ── ReportService ────────────────────────────────────────────────────────────

public class ReportService : IReportService
{
    private readonly IReportRepository _repo;
    private readonly ILogger<ReportService> _logger;

    public ReportService(IReportRepository repo, ILogger<ReportService> logger)
    { _repo = repo; _logger = logger; }

    public async Task<ReportResponseDto> CreateAsync(Guid reporterId, CreateReportDto dto, CancellationToken ct = default)
    {
        var report = new Report
        {
            Id = Guid.NewGuid(),
            PublicReference = $"RPT-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}",
            TripId = dto.TripId,
            ReporterId = reporterId,
            ReportedUserId = dto.ReportedUserId,
            Category = dto.Category,
            SeverityLevel = dto.SeverityLevel,
            Description = dto.Description,
            EvidenceUrls = dto.EvidenceUrls,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repo.AddAsync(report, ct);
        _logger.LogWarning("Signalement créé: {Ref} par {Reporter} catégorie={Cat}", report.PublicReference, reporterId, dto.Category);
        return MapReport(report);
    }

    public async Task<IEnumerable<ReportResponseDto>> GetMyReportsAsync(Guid userId, CancellationToken ct = default)
    {
        var reports = await _repo.GetByReporterIdAsync(userId, ct);
        return reports.Select(MapReport);
    }

    public async Task<ReportResponseDto?> GetByReferenceAsync(string publicReference, CancellationToken ct = default)
    {
        var report = await _repo.GetByReferenceAsync(publicReference, ct);
        return report == null ? null : MapReport(report);
    }

    private static ReportResponseDto MapReport(Report r) => new()
    {
        Id = r.Id, PublicReference = r.PublicReference, TripId = r.TripId,
        ReporterId = r.ReporterId, ReportedUserId = r.ReportedUserId,
        Category = r.Category.ToString(), SeverityLevel = r.SeverityLevel,
        Description = r.Description, Status = r.Status,
        CreatedAt = r.CreatedAt, ResolvedAt = r.ResolvedAt
    };
}
