using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Stats;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Stats;

public class UserStatsService : IUserStatsService
{
    private readonly AppDbContext _db;

    public UserStatsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserStatsRawDto?> GetRawStatsAsync(Guid userId, string periode, CancellationToken ct = default)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null) return null;

        var stats = await _db.UserStats
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId, ct);

        var cutoff = GetCutoff(periode);

        // Trajets comme conducteur filtrés par période
        var tripsQuery = _db.Trips
            .AsNoTracking()
            .Where(t => t.DriverId == userId);

        if (cutoff.HasValue)
        {
            var cutoffDate = DateOnly.FromDateTime(cutoff.Value.DateTime);
            tripsQuery = tripsQuery.Where(t => t.DepartureDate >= cutoffDate);
        }

        var trips = await tripsQuery
            .OrderByDescending(t => t.DepartureDate)
            .ThenByDescending(t => t.DepartureTime)
            .Take(50)
            .Select(t => new TripStatDto
            {
                Id = t.Id,
                DepartureLabel = t.DepartureLabel,
                ArrivalLabel = t.ArrivalLabel,
                DepartureDate = t.DepartureDate,
                PassengerCount = t.CurrentPassengers,
                DistanceKm = t.EstimatedDistanceKm,
                PricePerPassenger = t.PricePerPassenger,
                Co2SavedKg = t.Co2SavedKg ?? 0,
                Status = t.Status.ToString(),
                AverageRating = t.AverageRating
            })
            .ToListAsync(ct);

        // Avis reçus filtrés par période
        var reviewsQuery = _db.Reviews
            .AsNoTracking()
            .Where(r => r.RevieweeId == userId);

        if (cutoff.HasValue)
            reviewsQuery = reviewsQuery.Where(r => r.CreatedAt >= cutoff.Value);

        var reviews = await reviewsQuery
            .Select(r => new ReviewStatDto
            {
                Rating = r.Rating,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(ct);

        // Badges obtenus
        var badges = await _db.UserBadges
            .AsNoTracking()
            .Where(ub => ub.UserId == userId)
            .Include(ub => ub.Badge)
            .Select(ub => new BadgeStatDto
            {
                BadgeId = ub.BadgeId,
                Name = ub.Badge.Name,
                Description = ub.Badge.Description,
                Category = ub.Badge.Category,
                IconUrl = ub.Badge.IconUrl,
                ObtainedAt = ub.AwardedAt
            })
            .ToListAsync(ct);

        return new UserStatsRawDto
        {
            UserId = userId,
            GoScore = user.GoScore,
            TotalTripsAsDriver = stats?.TotalTripsAsDriver ?? 0,
            TotalTripsAsPassenger = stats?.TotalTripsAsPassenger ?? 0,
            TotalCo2SavedKg = stats?.TotalCo2SavedKg ?? 0,
            TotalDistanceKm = stats?.TotalDistanceKm ?? 0,
            AverageRatingAsDriver = stats?.AverageRatingAsDriver ?? 0,
            TotalReviewsReceived = stats?.TotalReviewsReceived ?? 0,
            TotalEarningsDriver = stats?.TotalEarningsDriver ?? 0,
            Trips = trips,
            Reviews = reviews,
            Badges = badges
        };
    }

    private static DateTimeOffset? GetCutoff(string periode) => periode switch
    {
        "7j" => DateTimeOffset.UtcNow.AddDays(-7),
        "mois" => DateTimeOffset.UtcNow.AddMonths(-1),
        "3mois" => DateTimeOffset.UtcNow.AddMonths(-3),
        "6mois" => DateTimeOffset.UtcNow.AddMonths(-6),
        _ => null // "tout" = pas de filtre
    };
}
