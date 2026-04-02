namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Matching;

// ── Recherche ────────────────────────────────────────────────────────────────

public class MatchingSearchDto
{
    public double? DepartureLat { get; set; }
    public double? DepartureLng { get; set; }
    public double? ArrivalLat { get; set; }
    public double? ArrivalLng { get; set; }
    public double DepartureRadiusMeters { get; set; } = 1000;
    public double ArrivalRadiusMeters { get; set; } = 1000;
    public DateOnly? Date { get; set; }
    public double? DesiredHour { get; set; }
    public double? DesiredArrivalHour { get; set; }
    public int? DesiredWeekday { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinSeatsAvailable { get; set; }
    public string SortKey { get; set; } = "matching_desc";
}

// ── Score v4 ─────────────────────────────────────────────────────────────────

public class MatchingScoreDto
{
    public int Total { get; set; }

    // Bloc A — Géographie (20 pts)
    public int GeoDepart { get; set; }
    public int GeoArrivee { get; set; }

    // Bloc B — Compatibilité comportementale (30 pts)
    public int CompatMusique { get; set; }
    public int CompatConversation { get; set; }
    public int CompatBagages { get; set; }
    public int CompatLangue { get; set; }

    // Bloc C — Fiabilité conducteur (25 pts)
    public int FiabiliteNote { get; set; }
    public int FiabiliteAnnulation { get; set; }
    public int FiabilitePonctualite { get; set; }
    public int FiabiliteVerifie { get; set; }

    // Bloc D — Affinité sociale (15 pts)
    public int AffiniteFavoris { get; set; }
    public int AffiniteNote { get; set; }
    public int AffiniteTrajets { get; set; }

    // Bloc E — Horaire (10 pts)
    public int Horaire { get; set; }

    // Bonus
    public int BonusRecurrence { get; set; }

    public string? EliminationReason { get; set; }
}

// ── Résultat ─────────────────────────────────────────────────────────────────

public class MatchingResultDto
{
    public IEnumerable<MatchedTripDto> Trips { get; set; } = [];
    public int TotalEvaluated { get; set; }
    public int TotalEliminated { get; set; }
    public int TotalMatched { get; set; }
}

public class MatchedTripDto
{
    public Guid TripId { get; set; }
    public Guid DriverId { get; set; }
    public string DriverFirstName { get; set; } = string.Empty;
    public decimal DriverRating { get; set; }
    public bool DriverVerified { get; set; }

    public string DepartureLabel { get; set; } = string.Empty;
    public string ArrivalLabel { get; set; } = string.Empty;
    public DateOnly DepartureDate { get; set; }
    public string DepartureTime { get; set; } = string.Empty;
    public int EstimatedDurationMinutes { get; set; }
    public decimal EstimatedDistanceKm { get; set; }
    public decimal PassengerPrice { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public int AvailableSeats { get; set; }

    public MatchingScoreDto Score { get; set; } = new();
}
