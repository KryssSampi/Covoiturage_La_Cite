using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Matching;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using UserEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.User;
using TripEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.Trip;
using AffinityEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.Affinity;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Matching;

/// <summary>
/// Matching v4 — port serveur de l'algorithme de recherche de trajets.
/// Phase 0: Hard Eliminators, Phase 1: Scoring 0-100 (5 blocs), Phase 2: Tri.
/// </summary>
public class MatchingService : IMatchingService
{
    private readonly AppDbContext _db;
    private readonly ILogger<MatchingService> _logger;

    private const double EARTH_R = 6_371_000;

    public MatchingService(AppDbContext db, ILogger<MatchingService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<MatchingResultDto> SearchTripsAsync(Guid passengerId, MatchingSearchDto search, CancellationToken ct = default)
    {
        var passenger = await _db.Users.FirstOrDefaultAsync(u => u.Id == passengerId, ct)
            ?? throw new KeyNotFoundException("Passager introuvable");

        // Charger les trajets publiés (potentiellement filtrés par date)
        var query = _db.Trips
            .Include(t => t.Driver)
            .Include(t => t.Reservations)
            .Where(t => t.Status == TripStatus.Published);

        if (search.Date.HasValue)
            query = query.Where(t => t.DepartureDate == search.Date.Value);

        var trips = await query.ToListAsync(ct);

        // Charger les affinités du passager
        var affinities = await _db.Affinities
            .Where(a => a.UserId == passengerId || a.TargetUserId == passengerId)
            .ToListAsync(ct);

        var results = new List<MatchedTripDto>();
        var totalEliminated = 0;

        foreach (var trip in trips)
        {
            var score = ScoreTrip(trip, passenger, affinities, search);

            if (score.EliminationReason != null)
            {
                totalEliminated++;
                continue;
            }

            results.Add(new MatchedTripDto
            {
                TripId = trip.Id,
                DriverId = trip.DriverId,
                DriverFirstName = trip.Driver?.FirstName ?? "",
                DriverRating = trip.Driver?.DriverProfile?.AverageRating ?? 5.0m,
                DriverVerified = trip.Driver?.IsProfileVerified ?? false,
                DepartureLabel = trip.DepartureLabel,
                ArrivalLabel = trip.ArrivalLabel,
                DepartureDate = trip.DepartureDate,
                DepartureTime = trip.DepartureTime.ToString("HH:mm"),
                EstimatedDurationMinutes = trip.EstimatedDurationMinutes,
                EstimatedDistanceKm = trip.EstimatedDistanceKm,
                PassengerPrice = trip.PassengerPrice,
                PaymentMethod = trip.PaymentMethod.ToString(),
                AvailableSeats = trip.MaxPassengers - trip.CurrentPassengers,
                Score = score
            });
        }

        // Phase 2 — Tri
        results = search.SortKey switch
        {
            "price_asc" => results.OrderBy(r => r.PassengerPrice).ToList(),
            "price_desc" => results.OrderByDescending(r => r.PassengerPrice).ToList(),
            "departure_asc" => results.OrderBy(r => r.DepartureTime).ToList(),
            "seats_desc" => results.OrderByDescending(r => r.AvailableSeats).ToList(),
            _ => results.OrderByDescending(r => r.Score.Total).ToList() // matching_desc
        };

        return new MatchingResultDto
        {
            Trips = results,
            TotalEvaluated = trips.Count,
            TotalEliminated = totalEliminated,
            TotalMatched = results.Count
        };
    }

    public async Task<MatchingScoreDto?> ComputeScoreAsync(Guid passengerId, Guid tripId, CancellationToken ct = default)
    {
        var passenger = await _db.Users.FirstOrDefaultAsync(u => u.Id == passengerId, ct);
        var trip = await _db.Trips.Include(t => t.Driver).Include(t => t.Reservations)
            .FirstOrDefaultAsync(t => t.Id == tripId, ct);
        if (passenger == null || trip == null) return null;

        var affinities = await _db.Affinities
            .Where(a => a.UserId == passengerId || a.TargetUserId == passengerId)
            .ToListAsync(ct);

        return ScoreTrip(trip, passenger, affinities, new MatchingSearchDto());
    }

    // ═════════════════════════════════════════════════════════════════════════
    // SCORING ENGINE
    // ═════════════════════════════════════════════════════════════════════════

    private MatchingScoreDto ScoreTrip(TripEntity trip, UserEntity passenger, List<AffinityEntity> affinities, MatchingSearchDto search)
    {
        var score = new MatchingScoreDto();

        // ── PHASE 0 — HARD ELIMINATORS ─────────────────────────────────────

        if (trip.Status != TripStatus.Published)
        { score.EliminationReason = "trip_not_published"; return score; }

        if (trip.CurrentPassengers >= trip.MaxPassengers)
        { score.EliminationReason = "trip_full"; return score; }

        if (trip.DriverId == passenger.Id)
        { score.EliminationReason = "already_passenger"; return score; }

        // Géo départ
        if (search.DepartureLat.HasValue && search.DepartureLng.HasValue)
        {
            var dist = Haversine(search.DepartureLat.Value, search.DepartureLng.Value,
                trip.DeparturePoint.Y, trip.DeparturePoint.X);
            if (dist > search.DepartureRadiusMeters)
            { score.EliminationReason = "geo_departure_too_far"; return score; }
        }

        // Géo arrivée
        if (search.ArrivalLat.HasValue && search.ArrivalLng.HasValue)
        {
            var dist = Haversine(search.ArrivalLat.Value, search.ArrivalLng.Value,
                trip.ArrivalPoint.Y, trip.ArrivalPoint.X);
            if (dist > search.ArrivalRadiusMeters)
            { score.EliminationReason = "geo_arrival_too_far"; return score; }
        }

        // Affinité négative (blocked)
        var affinity = affinities.FirstOrDefault(a =>
            (a.UserId == passenger.Id && a.TargetUserId == trip.DriverId) ||
            (a.UserId == trip.DriverId && a.TargetUserId == passenger.Id));
        if (affinity?.IsBlocked == true)
        { score.EliminationReason = "bad_past_experience"; return score; }

        // Prix max
        if (search.MaxPrice.HasValue && trip.PassengerPrice > search.MaxPrice.Value)
        { score.EliminationReason = "payment_incompatible"; return score; }

        // ── PHASE 1 — SCORING ──────────────────────────────────────────────

        // Bloc A — Géographie (20 pts: départ 12, arrivée 8)
        if (search.DepartureLat.HasValue && search.DepartureLng.HasValue)
        {
            var dist = Haversine(search.DepartureLat.Value, search.DepartureLng.Value,
                trip.DeparturePoint.Y, trip.DeparturePoint.X);
            score.GeoDepart = GeoScore(dist, 12, 400);
        }
        else score.GeoDepart = 6;

        if (search.ArrivalLat.HasValue && search.ArrivalLng.HasValue)
        {
            var dist = Haversine(search.ArrivalLat.Value, search.ArrivalLng.Value,
                trip.ArrivalPoint.Y, trip.ArrivalPoint.X);
            score.GeoArrivee = GeoScore(dist, 8, 400);
        }
        else score.GeoArrivee = 4;

        // Bloc B — Compatibilité comportementale (30 pts)
        score.CompatMusique = trip.MusicAllowed ? 8 : 4;
        score.CompatConversation = trip.ConversationLevel == ConversationLevel.Moderate ? 10 : 5;
        score.CompatBagages = trip.BaggageAllowed ? 6 : 3;
        score.CompatLangue = 6; // default bilingual

        // Bloc C — Fiabilité conducteur (25 pts)
        var driverRating = trip.Driver?.DriverProfile?.AverageRating ?? 5.0m;
        score.FiabiliteNote = (int)Math.Round((double)driverRating / 5.0 * 10);
        score.FiabiliteAnnulation = 8; // TODO: calculer depuis l'historique
        score.FiabilitePonctualite = 5;
        score.FiabiliteVerifie = (trip.Driver?.IsProfileVerified ?? false) ? 2 : 0;

        // Bloc D — Affinité sociale (15 pts)
        if (affinity?.IsActuallyFavorite == true)
            score.AffiniteFavoris = 10;
        else
            score.AffiniteFavoris = 0;

        score.AffiniteNote = affinity != null ? (int)Math.Min(5, affinity.AffinityScore) : 0;
        score.AffiniteTrajets = IsSameSchoolRole(passenger, trip.Driver) ? 5 : 0;

        // Bloc E — Horaire (10 pts)
        if (search.DesiredHour.HasValue)
        {
            var tripHour = trip.DepartureTime.Hour + trip.DepartureTime.Minute / 60.0;
            var diff = Math.Abs(tripHour - search.DesiredHour.Value);
            score.Horaire = diff switch
            {
                <= 0.25 => 10,
                <= 0.5 => 8,
                <= 1.0 => 6,
                <= 2.0 => 3,
                <= 3.0 => 1,
                _ => 0
            };
        }
        else score.Horaire = 5;

        // Bonus récurrence
        if (search.DesiredWeekday.HasValue && trip.RecurrenceDays != null &&
            trip.RecurrenceDays.Contains(search.DesiredWeekday.Value))
            score.BonusRecurrence = 5;

        // Total
        score.Total = score.GeoDepart + score.GeoArrivee
            + score.CompatMusique + score.CompatConversation + score.CompatBagages + score.CompatLangue
            + score.FiabiliteNote + score.FiabiliteAnnulation + score.FiabilitePonctualite + score.FiabiliteVerifie
            + score.AffiniteFavoris + score.AffiniteNote + score.AffiniteTrajets
            + score.Horaire + score.BonusRecurrence;

        return score;
    }

    // ── Utilitaires ──────────────────────────────────────────────────────────

    private static double Haversine(double lat1, double lng1, double lat2, double lng2)
    {
        var dLat = ToRad(lat2 - lat1);
        var dLng = ToRad(lng2 - lng1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return EARTH_R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private static int GeoScore(double distMeters, int maxPts, double decayM = 400)
        => (int)Math.Round(maxPts * Math.Exp(-distMeters / decayM));

    private static bool IsSameSchoolRole(UserEntity passenger, UserEntity? driver)
        => driver != null && passenger.SchoolRole == driver.SchoolRole;
}
