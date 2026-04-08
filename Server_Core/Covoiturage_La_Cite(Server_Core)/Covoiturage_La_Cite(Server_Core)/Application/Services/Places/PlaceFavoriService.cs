using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Places;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Places;

public class PlaceFavoriService : IPlaceFavoriService
{
    private readonly AppDbContext _db;
    private readonly ILogger<PlaceFavoriService> _logger;

    public PlaceFavoriService(AppDbContext db, ILogger<PlaceFavoriService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<PlaceFavoriResponseDto>> GetByUserAsync(Guid userId, CancellationToken ct = default)
    {
        var places = await _db.PlacesFavoris
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.IsAnchored)
            .ThenBy(p => p.CreatedAt)
            .ToListAsync(ct);

        return places.Select(Map);
    }

    public async Task<PlaceFavoriResponseDto> CreateAsync(Guid userId, CreatePlaceFavoriDto dto, CancellationToken ct = default)
    {
        var place = new PlaceFavori
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Pseudonyme = dto.Pseudonyme.Trim(),
            Adresse = dto.Adresse.Trim(),
            Lat = dto.Lat,
            Lng = dto.Lng,
            IconTag = dto.IconTag,
            IsAnchored = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.PlacesFavoris.Add(place);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("PlaceFavori créée pour {UserId} : {Pseudonyme}", userId, place.Pseudonyme);
        return Map(place);
    }

    public async Task DeleteAsync(Guid userId, Guid placeId, CancellationToken ct = default)
    {
        var place = await _db.PlacesFavoris
            .FirstOrDefaultAsync(p => p.Id == placeId && p.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Lieu favori introuvable");

        if (place.IsAnchored)
            throw new InvalidOperationException("Les lieux ancrés ne peuvent pas être supprimés");

        _db.PlacesFavoris.Remove(place);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("PlaceFavori {PlaceId} supprimée par {UserId}", placeId, userId);
    }

    private static PlaceFavoriResponseDto Map(PlaceFavori p) => new()
    {
        Id = p.Id,
        Pseudonyme = p.Pseudonyme,
        Adresse = p.Adresse,
        Lat = p.Lat,
        Lng = p.Lng,
        IconTag = p.IconTag,
        IsAnchored = p.IsAnchored
    };
}
