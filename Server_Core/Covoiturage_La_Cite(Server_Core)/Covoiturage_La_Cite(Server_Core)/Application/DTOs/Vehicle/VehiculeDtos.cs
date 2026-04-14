namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Vehicle;

public record VehiculeResponseDto
{
    public Guid Id { get; init; }
    public Guid DriverProfileId { get; init; }
    public string Make { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
    public int Year { get; init; }
    public string LicensePlate { get; init; } = string.Empty;
    public string Color { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public bool IsActive { get; init; }
    public bool IsDefault { get; init; }
    public string? PhotoUrl { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record CreateVehiculeDto
{
    public string Make { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
    public int Year { get; init; }
    public string LicensePlate { get; init; } = string.Empty;
    public string Color { get; init; } = string.Empty;
    public int Capacity { get; init; } = 4;
    public string? PhotoUrl { get; init; }
}

public record UpdateVehiculeDto
{
    public string? Make { get; init; }
    public string? Model { get; init; }
    public int? Year { get; init; }
    public string? LicensePlate { get; init; }
    public string? Color { get; init; }
    public int? Capacity { get; init; }
    public string? PhotoUrl { get; init; }
}
