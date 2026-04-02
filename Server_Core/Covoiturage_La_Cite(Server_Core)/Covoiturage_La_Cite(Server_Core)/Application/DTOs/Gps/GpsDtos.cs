namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gps;

// ── GPS Position DTOs ────────────────────────────────────────────────────────

public class GpsPositionResponseDto
{
    public long Id { get; set; }
    public Guid TripId { get; set; }
    public Guid UserId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal SpeedKmh { get; set; }
    public decimal HeadingDegrees { get; set; }
    public decimal AccuracyMeters { get; set; }
    public DateTimeOffset CapturedAt { get; set; }
}

public class RecordPositionDto
{
    public Guid TripId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal SpeedKmh { get; set; }
    public decimal HeadingDegrees { get; set; }
    public decimal AccuracyMeters { get; set; }
    public DateTimeOffset? CapturedAt { get; set; }
}

// ── SOS Alert DTOs ───────────────────────────────────────────────────────────

public class SosAlertResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TripId { get; set; }
    public string EmergencyType { get; set; } = string.Empty;
    public double TriggerLatitude { get; set; }
    public double TriggerLongitude { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool EmergencyContactsNotified { get; set; }
    public DateTimeOffset TriggeredAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
}

public class TriggerSosDto
{
    public Guid TripId { get; set; }
    public string EmergencyType { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
