namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Places;

public record PlaceFavoriResponseDto
{
    public Guid Id { get; init; }
    public string Pseudonyme { get; init; } = string.Empty;
    public string Adresse { get; init; } = string.Empty;
    public decimal Lat { get; init; }
    public decimal Lng { get; init; }
    public string IconTag { get; init; } = "autre";
    public bool IsAnchored { get; init; }
}

public record CreatePlaceFavoriDto
{
    public string Pseudonyme { get; init; } = string.Empty;
    public string Adresse { get; init; } = string.Empty;
    public decimal Lat { get; init; }
    public decimal Lng { get; init; }
    public string IconTag { get; init; } = "autre";
}
