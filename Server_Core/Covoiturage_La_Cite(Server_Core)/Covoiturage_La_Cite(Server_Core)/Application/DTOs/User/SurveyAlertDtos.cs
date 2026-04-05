namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

public record CreateSurveyAlertDto
{
    public Guid DriverId { get; init; }
    public string DriverName { get; init; } = string.Empty;
    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
}

public record SurveyTripAlertDto
{
    public Guid Id { get; init; }
    public Guid DriverId { get; init; }
    public string DriverName { get; init; } = string.Empty;
    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}
