using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;
using MongoDB.Driver;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Content;

public class FaqService : IFaqService
{
    private readonly MongoDbContext _mongo;
    private readonly ILogger<FaqService> _logger;

    public FaqService(MongoDbContext mongo, ILogger<FaqService> logger)
    {
        _mongo = mongo;
        _logger = logger;
    }

    // ── Lecture ────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<FaqSectionResponseDto>> GetAllAsync(CancellationToken ct = default)
    {
        var sections = await _mongo.Faqs
            .Find(f => f.IsActive)
            .SortBy(f => f.Order)
            .ToListAsync(ct);

        return sections.Select(MapToDto);
    }

    public async Task<FaqSectionResponseDto?> GetByExternalIdAsync(string externalId, CancellationToken ct = default)
    {
        var section = await _mongo.Faqs
            .Find(f => f.ExternalId == externalId && f.IsActive)
            .FirstOrDefaultAsync(ct);

        return section == null ? null : MapToDto(section);
    }

    // ── Écriture (admin) ───────────────────────────────────────────────────────

    public async Task<FaqSectionResponseDto> CreateAsync(CreateFaqSectionDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.ExternalId))
            throw new ArgumentException("ExternalId est requis");

        // Vérifier l'unicité de l'ExternalId
        var existing = await _mongo.Faqs
            .Find(f => f.ExternalId == dto.ExternalId)
            .FirstOrDefaultAsync(ct);

        if (existing != null)
            throw new InvalidOperationException($"Une section FAQ avec l'ExternalId '{dto.ExternalId}' existe déjà");

        var faq = new FaqItem
        {
            ExternalId = dto.ExternalId.Trim(),
            SujetFr = dto.SujetFr.Trim(),
            SujetEn = dto.SujetEn.Trim(),
            Categorie = dto.Categorie.Trim(),
            Order = dto.Order,
            IsActive = true,
            Items = dto.Items.Select(i => new FaqQuestion
            {
                QuestionFr = i.QuestionFr.Trim(),
                QuestionEn = i.QuestionEn.Trim(),
                ReponseFr = i.ReponseFr.Trim(),
                ReponseEn = i.ReponseEn.Trim(),
                Order = i.Order
            }).ToList(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _mongo.Faqs.InsertOneAsync(faq, cancellationToken: ct);
        _logger.LogInformation("FAQ créée: {Id} ({ExternalId})", faq.Id, faq.ExternalId);
        return MapToDto(faq);
    }

    public async Task<FaqSectionResponseDto> UpdateAsync(string id, UpdateFaqSectionDto dto, CancellationToken ct = default)
    {
        var updateDefs = new List<UpdateDefinition<FaqItem>>();

        if (dto.SujetFr != null) updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.SujetFr, dto.SujetFr.Trim()));
        if (dto.SujetEn != null) updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.SujetEn, dto.SujetEn.Trim()));
        if (dto.Categorie != null) updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.Categorie, dto.Categorie.Trim()));
        if (dto.Order.HasValue) updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.Order, dto.Order.Value));
        if (dto.IsActive.HasValue) updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.IsActive, dto.IsActive.Value));
        if (dto.Items != null)
        {
            var items = dto.Items.Select(i => new FaqQuestion
            {
                QuestionFr = i.QuestionFr.Trim(),
                QuestionEn = i.QuestionEn.Trim(),
                ReponseFr = i.ReponseFr.Trim(),
                ReponseEn = i.ReponseEn.Trim(),
                Order = i.Order
            }).ToList();
            updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.Items, items));
        }

        updateDefs.Add(Builders<FaqItem>.Update.Set(f => f.UpdatedAt, DateTimeOffset.UtcNow));

        var combined = Builders<FaqItem>.Update.Combine(updateDefs);

        var result = await _mongo.Faqs.UpdateOneAsync(f => f.Id == id, combined, cancellationToken: ct);

        if (result.MatchedCount == 0)
            throw new KeyNotFoundException($"FAQ {id} introuvable");

        // Retourner la version mise à jour
        var updated = await _mongo.Faqs.Find(f => f.Id == id).FirstOrDefaultAsync(ct);
        _logger.LogInformation("FAQ mise à jour: {Id}", id);
        return MapToDto(updated!);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _mongo.Faqs.DeleteOneAsync(f => f.Id == id, ct);
        if (result.DeletedCount == 0)
            throw new KeyNotFoundException($"FAQ {id} introuvable");

        _logger.LogInformation("FAQ supprimée: {Id}", id);
    }

    // ── Mapper ─────────────────────────────────────────────────────────────────

    private static FaqSectionResponseDto MapToDto(FaqItem f) => new()
    {
        Id = f.Id,
        ExternalId = f.ExternalId,
        SujetFr = f.SujetFr,
        SujetEn = f.SujetEn,
        Categorie = f.Categorie,
        Order = f.Order,
        Items = f.Items.Select(q => new FaqQuestionResponseDto
        {
            QuestionFr = q.QuestionFr,
            QuestionEn = q.QuestionEn,
            ReponseFr = q.ReponseFr,
            ReponseEn = q.ReponseEn,
            Order = q.Order
        })
    };
}