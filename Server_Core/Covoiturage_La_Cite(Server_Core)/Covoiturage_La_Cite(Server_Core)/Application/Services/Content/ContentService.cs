using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;
using MongoDB.Driver;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Content;

public class ContentService : IContentService
{
    private readonly MongoDbContext _mongo;
    private readonly ILogger<ContentService> _logger;

    public ContentService(MongoDbContext mongo, ILogger<ContentService> logger)
    {
        _mongo = mongo;
        _logger = logger;
    }

    // ── Astuces ───────────────────────────────────────────────────────────────

    public async Task<IEnumerable<AstuceResponseDto>> GetAstucesAsync(CancellationToken ct = default)
    {
        var astuces = await _mongo.Astuces
            .Find(a => a.IsActive)
            .SortBy(a => a.Order)
            .ToListAsync(ct);

        return astuces.Select(MapAstuce);
    }

    public async Task<AstuceResponseDto> CreateAstuceAsync(CreateAstuceDto dto, CancellationToken ct = default)
    {
        var astuce = new Astuce
        {
            ExternalId = dto.ExternalId,
            ImageUrl = dto.ImageUrl,
            TitleFr = dto.TitleFr,
            TitleEn = dto.TitleEn,
            DescriptionFr = dto.DescriptionFr,
            DescriptionEn = dto.DescriptionEn,
            Order = dto.Order,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _mongo.Astuces.InsertOneAsync(astuce, cancellationToken: ct);
        _logger.LogInformation("Astuce créée: {Id} ({ExternalId})", astuce.Id, astuce.ExternalId);
        return MapAstuce(astuce);
    }

    public async Task DeleteAstuceAsync(string id, CancellationToken ct = default)
    {
        var result = await _mongo.Astuces.DeleteOneAsync(a => a.Id == id, ct);
        if (result.DeletedCount == 0)
            throw new KeyNotFoundException($"Astuce {id} introuvable");
    }

    // ── Nouveautés ────────────────────────────────────────────────────────────

    public async Task<IEnumerable<NouveauteResponseDto>> GetNouveautesAsync(CancellationToken ct = default)
    {
        var nouveautes = await _mongo.Nouveautes
            .Find(n => n.IsPublished)
            .SortByDescending(n => n.CreatedAt)
            .ToListAsync(ct);

        return nouveautes.Select(MapNouveaute);
    }

    public async Task<NouveauteResponseDto> CreateNouveauteAsync(CreateNouveauteDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.VideoUrl))
            throw new ArgumentException("title et videoUrl sont requis");

        var year = DateTimeOffset.UtcNow.Year;
        var rand = Random.Shared.Next(10000, 99999);

        var nouveaute = new Nouveaute
        {
            ExternalId = $"NVT-{year}-{rand:D5}",
            Title = dto.Title.Trim(),
            VideoUrl = dto.VideoUrl.Trim(),
            ThumbnailUrl = dto.ThumbnailUrl,
            IsPublished = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _mongo.Nouveautes.InsertOneAsync(nouveaute, cancellationToken: ct);
        _logger.LogInformation("Nouveauté créée: {Id} ({ExternalId})", nouveaute.Id, nouveaute.ExternalId);
        return MapNouveaute(nouveaute);
    }

    public async Task DeleteNouveauteAsync(string id, CancellationToken ct = default)
    {
        var result = await _mongo.Nouveautes.DeleteOneAsync(n => n.Id == id, ct);
        if (result.DeletedCount == 0)
            throw new KeyNotFoundException($"Nouveauté {id} introuvable");
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static AstuceResponseDto MapAstuce(Astuce a) => new()
    {
        Id = a.Id,
        ExternalId = a.ExternalId,
        ImageUrl = a.ImageUrl,
        TitleFr = a.TitleFr,
        TitleEn = a.TitleEn,
        DescriptionFr = a.DescriptionFr,
        DescriptionEn = a.DescriptionEn,
        Order = a.Order
    };

    private static NouveauteResponseDto MapNouveaute(Nouveaute n) => new()
    {
        Id = n.Id,
        ExternalId = n.ExternalId,
        Title = n.Title,
        VideoUrl = n.VideoUrl,
        ThumbnailUrl = n.ThumbnailUrl,
        CreatedAt = n.CreatedAt
    };
}
