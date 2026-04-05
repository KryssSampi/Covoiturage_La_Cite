using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface ITrajetService
{
    Task<TrajetResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TrajetResponseDto> CreateAsync(Guid driverId, CreateTrajetDto dto, CancellationToken ct = default);
    Task<TrajetResponseDto> UpdateAsync(Guid tripId, Guid driverId, UpdateTrajetDto dto, CancellationToken ct = default);
    Task<TrajetResponseDto> PublishAsync(Guid tripId, Guid driverId, CancellationToken ct = default);
    Task<TrajetResponseDto> StartAsync(Guid tripId, Guid driverId, CancellationToken ct = default);
    Task<TrajetResponseDto> CompleteAsync(Guid tripId, Guid driverId, CancellationToken ct = default);
    Task CancelAsync(Guid tripId, Guid driverId, string? reason, CancellationToken ct = default);
    Task<TrajetResponseDto> SaveDraftAsync(Guid driverId, CreateTrajetDto dto, CancellationToken ct = default);

    Task<PaginatedResult<TrajetResponseDto>> SearchAsync(TrajetSearchDto criteria, CancellationToken ct = default);
    Task<PaginatedResult<TrajetResponseDto>> GetDriverTripsAsync(Guid driverId, string? status, int page, int pageSize, CancellationToken ct = default);
    Task<PaginatedResult<TrajetResponseDto>> GetDriverHistoriqueAsync(Guid driverId, int page, int pageSize, CancellationToken ct = default);
    Task<PaginatedResult<TrajetResponseDto>> GetPassengerHistoriqueAsync(Guid passengerId, int page, int pageSize, CancellationToken ct = default);
    Task<TrajetEnCoursDto?> GetTripEnCoursAsync(Guid tripId, CancellationToken ct = default);
    Task<IEnumerable<TrajetPassengerDto>> GetTripPassengersAsync(Guid tripId, CancellationToken ct = default);

    // Brouillons
    Task<IEnumerable<TrajetResponseDto>> GetDraftsAsync(Guid driverId, CancellationToken ct = default);
    Task<TrajetResponseDto?> GetDraftByIdAsync(Guid draftId, Guid driverId, CancellationToken ct = default);

    // Recommandations
    /// <summary>
    /// Retourne jusqu'à 5 trajets recommandés pour l'utilisateur.
    /// Analyse les destinations récentes/récurrentes ; fallback : 5 trajets publiés aléatoires.
    /// </summary>
    Task<IEnumerable<TrajetResponseDto>> GetRecommendedAsync(Guid userId, CancellationToken ct = default);
}
