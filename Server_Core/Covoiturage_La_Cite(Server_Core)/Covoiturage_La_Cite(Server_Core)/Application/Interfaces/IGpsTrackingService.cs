using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gps;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IGpsTrackingService
{
    // GPS positions
    Task<GpsPositionResponseDto> RecordPositionAsync(Guid userId, RecordPositionDto dto, CancellationToken ct = default);
    Task RecordBatchAsync(Guid userId, IEnumerable<RecordPositionDto> batch, CancellationToken ct = default);
    Task<GpsPositionResponseDto?> GetLatestPositionAsync(Guid tripId, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<GpsPositionResponseDto>> GetTripTraceAsync(Guid tripId, DateTimeOffset? since = null, CancellationToken ct = default);

    // SOS Alerts
    Task<SosAlertResponseDto> TriggerSosAsync(Guid userId, TriggerSosDto dto, CancellationToken ct = default);
    Task<SosAlertResponseDto> ResolveSosAsync(Guid alertId, CancellationToken ct = default);
    Task<IEnumerable<SosAlertResponseDto>> GetMySosAlertsAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<SosAlertResponseDto>> GetPendingSosAlertsAsync(CancellationToken ct = default);
}
