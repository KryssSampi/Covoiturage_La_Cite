using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface ITrajetRepository : Domain.Interfaces.IRepository<Trip>
{
    Task<Trip?> GetWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Trip>> GetByDriverIdAsync(Guid driverId, TripStatus? status = null, CancellationToken ct = default);
    Task<IEnumerable<Trip>> GetDraftsByDriverIdAsync(Guid driverId, CancellationToken ct = default);
    Task<IEnumerable<Trip>> SearchAsync(TripSearchCriteria criteria, CancellationToken ct = default);
    Task<int> SearchCountAsync(TripSearchCriteria criteria, CancellationToken ct = default);
    Task<IEnumerable<Trip>> GetDriverHistoriqueAsync(Guid driverId, int page, int pageSize, CancellationToken ct = default);
    Task<IEnumerable<Trip>> GetPassengerHistoriqueAsync(Guid passengerId, int page, int pageSize, CancellationToken ct = default);
    Task<Trip?> GetTripEnCoursAsync(Guid tripId, CancellationToken ct = default);
}

/// <summary>
/// Critères de recherche géospatiale pour les trajets.
/// </summary>
public class TripSearchCriteria
{
    public double? DepartureLat { get; set; }
    public double? DepartureLng { get; set; }
    public double? ArrivalLat { get; set; }
    public double? ArrivalLng { get; set; }
    public double RadiusKm { get; set; } = 5.0;
    public DateOnly? Date { get; set; }
    public TimeOnly? TimeMin { get; set; }
    public TimeOnly? TimeMax { get; set; }
    public int? MaxPassengers { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
