using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gps;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Gps;

public class GpsTrackingService : IGpsTrackingService
{
    private readonly IGpsPositionRepository _gpsRepo;
    private readonly ISosAlertRepository _sosRepo;
    private readonly ILogger<GpsTrackingService> _logger;

    public GpsTrackingService(
        IGpsPositionRepository gpsRepo,
        ISosAlertRepository sosRepo,
        ILogger<GpsTrackingService> logger)
    {
        _gpsRepo = gpsRepo;
        _sosRepo = sosRepo;
        _logger = logger;
    }

    // ── GPS Positions ────────────────────────────────────────────────────────

    public async Task<GpsPositionResponseDto> RecordPositionAsync(Guid userId, RecordPositionDto dto, CancellationToken ct = default)
    {
        var position = new GpsPosition
        {
            TripId = dto.TripId,
            UserId = userId,
            Location = new Point(dto.Longitude, dto.Latitude) { SRID = 4326 },
            SpeedKmh = dto.SpeedKmh,
            HeadingDegrees = dto.HeadingDegrees,
            AccuracyMeters = dto.AccuracyMeters,
            CapturedAt = dto.CapturedAt ?? DateTimeOffset.UtcNow
        };

        await _gpsRepo.AddAsync(position, ct);
        return MapPosition(position);
    }

    public async Task RecordBatchAsync(Guid userId, IEnumerable<RecordPositionDto> batch, CancellationToken ct = default)
    {
        var positions = batch.Select(dto => new GpsPosition
        {
            TripId = dto.TripId,
            UserId = userId,
            Location = new Point(dto.Longitude, dto.Latitude) { SRID = 4326 },
            SpeedKmh = dto.SpeedKmh,
            HeadingDegrees = dto.HeadingDegrees,
            AccuracyMeters = dto.AccuracyMeters,
            CapturedAt = dto.CapturedAt ?? DateTimeOffset.UtcNow
        });

        await _gpsRepo.BulkInsertAsync(positions, ct);
        _logger.LogInformation("Batch GPS: {Count} positions enregistrées pour {UserId}", batch.Count(), userId);
    }

    public async Task<GpsPositionResponseDto?> GetLatestPositionAsync(Guid tripId, Guid userId, CancellationToken ct = default)
    {
        var pos = await _gpsRepo.GetLatestByTripAndUserAsync(tripId, userId, ct);
        return pos == null ? null : MapPosition(pos);
    }

    public async Task<IEnumerable<GpsPositionResponseDto>> GetTripTraceAsync(Guid tripId, DateTimeOffset? since = null, CancellationToken ct = default)
    {
        var trace = await _gpsRepo.GetTripTraceAsync(tripId, since, ct);
        return trace.Select(MapPosition);
    }

    // ── SOS Alerts ───────────────────────────────────────────────────────────

    public async Task<SosAlertResponseDto> TriggerSosAsync(Guid userId, TriggerSosDto dto, CancellationToken ct = default)
    {
        // Vérifier si une alerte est déjà active pour ce trajet
        var existing = await _sosRepo.GetActiveByTripAsync(dto.TripId, ct);
        if (existing != null)
            throw new InvalidOperationException("Une alerte SOS est déjà active pour ce trajet");

        // Capturer un snapshot GPS récent
        var recentPositions = await _gpsRepo.GetTripTraceAsync(dto.TripId, DateTimeOffset.UtcNow.AddMinutes(-5), ct);
        var snapshotJson = System.Text.Json.JsonSerializer.Serialize(
            recentPositions.Select(p => new { lat = p.Location.Y, lng = p.Location.X, at = p.CapturedAt }));

        var alert = new SosAlert
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TripId = dto.TripId,
            EmergencyType = dto.EmergencyType,
            TriggerLocation = new Point(dto.Longitude, dto.Latitude) { SRID = 4326 },
            Status = "triggered",
            EmergencyContactsNotified = false,
            GpsSnapshotJson = snapshotJson,
            TriggeredAt = DateTimeOffset.UtcNow
        };

        await _sosRepo.AddAsync(alert, ct);
        _logger.LogCritical("SOS déclenché par {UserId} sur trajet {TripId} — type: {Type}", userId, dto.TripId, dto.EmergencyType);

        return MapSosAlert(alert);
    }

    public async Task<SosAlertResponseDto> ResolveSosAsync(Guid alertId, CancellationToken ct = default)
    {
        var alert = await _sosRepo.GetByIdAsync(alertId, ct)
            ?? throw new KeyNotFoundException("Alerte SOS introuvable");

        if (alert.ResolvedAt.HasValue)
            throw new InvalidOperationException("Cette alerte est déjà résolue");

        alert.Status = "resolved";
        alert.ResolvedAt = DateTimeOffset.UtcNow;
        await _sosRepo.UpdateAsync(alert, ct);

        _logger.LogInformation("SOS {AlertId} résolu", alertId);
        return MapSosAlert(alert);
    }

    public async Task<IEnumerable<SosAlertResponseDto>> GetMySosAlertsAsync(Guid userId, CancellationToken ct = default)
    {
        var alerts = await _sosRepo.GetByUserIdAsync(userId, ct);
        return alerts.Select(MapSosAlert);
    }

    public async Task<IEnumerable<SosAlertResponseDto>> GetPendingSosAlertsAsync(CancellationToken ct = default)
    {
        var alerts = await _sosRepo.GetPendingAsync(ct);
        return alerts.Select(MapSosAlert);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static GpsPositionResponseDto MapPosition(GpsPosition p) => new()
    {
        Id = p.Id,
        TripId = p.TripId,
        UserId = p.UserId,
        Latitude = p.Location.Y,
        Longitude = p.Location.X,
        SpeedKmh = p.SpeedKmh,
        HeadingDegrees = p.HeadingDegrees,
        AccuracyMeters = p.AccuracyMeters,
        CapturedAt = p.CapturedAt
    };

    private static SosAlertResponseDto MapSosAlert(SosAlert a) => new()
    {
        Id = a.Id,
        UserId = a.UserId,
        TripId = a.TripId,
        EmergencyType = a.EmergencyType,
        TriggerLatitude = a.TriggerLocation.Y,
        TriggerLongitude = a.TriggerLocation.X,
        Status = a.Status,
        EmergencyContactsNotified = a.EmergencyContactsNotified,
        TriggeredAt = a.TriggeredAt,
        ResolvedAt = a.ResolvedAt
    };
}
