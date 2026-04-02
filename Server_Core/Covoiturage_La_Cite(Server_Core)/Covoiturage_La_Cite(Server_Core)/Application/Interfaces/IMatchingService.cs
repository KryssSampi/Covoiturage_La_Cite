using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Matching;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IMatchingService
{
    /// <summary>
    /// Recherche de trajets pour un passager avec scoring v4.
    /// Phase 0: hard eliminators, Phase 1: scoring 0-100, Phase 2: tri.
    /// </summary>
    Task<MatchingResultDto> SearchTripsAsync(Guid passengerId, MatchingSearchDto search, CancellationToken ct = default);

    /// <summary>
    /// Calcul du score de compatibilité entre un passager et un trajet spécifique.
    /// </summary>
    Task<MatchingScoreDto?> ComputeScoreAsync(Guid passengerId, Guid tripId, CancellationToken ct = default);
}
