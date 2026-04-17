using System.Reflection;
using System.Text.Json;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;
using MongoDB.Driver;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB;

/// <summary>
/// Initialise la base MongoDB au démarrage :
/// - Crée les collections si elles n'existent pas
/// - Pose les indexes
/// - Insère des données de seed (astuces, nouveautés)
/// - Patche les champs manquants sur les docs existants
/// </summary>
public static class MongoDbInitializer
{
    public static async Task InitializeAsync(MongoDbContext ctx, ILogger logger, CancellationToken ct = default)
    {
        try
        {
            // ── Indexes ChatMessages ──────────────────────────────────────────────
            var chatIdx = ctx.ChatMessages.Indexes;
            await chatIdx.CreateManyAsync(
            [
                new CreateIndexModel<ChatMessage>(
                    Builders<ChatMessage>.IndexKeys
                        .Ascending(m => m.TripId)
                        .Ascending(m => m.SenderId)
                        .Ascending(m => m.RecipientId),
                    new CreateIndexOptions { Name = "idx_chat_trip_participants" }),
                new CreateIndexModel<ChatMessage>(
                    Builders<ChatMessage>.IndexKeys.Descending(m => m.CreatedAt),
                    new CreateIndexOptions { Name = "idx_chat_created_desc" }),
                new CreateIndexModel<ChatMessage>(
                    Builders<ChatMessage>.IndexKeys
                        .Ascending(m => m.RecipientId)
                        .Ascending(m => m.IsRead),
                    new CreateIndexOptions { Name = "idx_chat_unread" }),
            ], ct);

            // ── Indexes UserActivities ────────────────────────────────────────────
            var actIdx = ctx.UserActivities.Indexes;
            await actIdx.CreateManyAsync(
            [
                new CreateIndexModel<UserActivity>(
                    Builders<UserActivity>.IndexKeys.Ascending(a => a.UserId),
                    new CreateIndexOptions { Name = "idx_activity_user", Unique = true }),
                new CreateIndexModel<UserActivity>(
                    Builders<UserActivity>.IndexKeys.Descending(a => a.LastSeenAt),
                    new CreateIndexOptions { Name = "idx_activity_lastseen" }),
            ], ct);

            // ── Indexes AppLogs ───────────────────────────────────────────────────
            var logIdx = ctx.AppLogs.Indexes;
            await logIdx.CreateManyAsync(
            [
                new CreateIndexModel<AppLog>(
                    Builders<AppLog>.IndexKeys.Descending(l => l.Timestamp),
                    new CreateIndexOptions { Name = "idx_log_timestamp" }),
                new CreateIndexModel<AppLog>(
                    Builders<AppLog>.IndexKeys.Ascending(l => l.Level),
                    new CreateIndexOptions { Name = "idx_log_level" }),
            ], ct);

            // ── Indexes Astuces ───────────────────────────────────────────────────
            var astIdx = ctx.Astuces.Indexes;
            await astIdx.CreateOneAsync(
                new CreateIndexModel<Astuce>(
                    Builders<Astuce>.IndexKeys.Ascending(a => a.ExternalId),
                    new CreateIndexOptions { Name = "idx_astuce_external_id", Unique = true }),
                cancellationToken: ct);

            // ── Indexes Nouveautes ────────────────────────────────────────────────
            var nvtIdx = ctx.Nouveautes.Indexes;
            await nvtIdx.CreateOneAsync(
                new CreateIndexModel<Nouveaute>(
                    Builders<Nouveaute>.IndexKeys.Ascending(n => n.ExternalId),
                    new CreateIndexOptions { Name = "idx_nouveaute_external_id", Unique = true }),
                cancellationToken: ct);

            // ── Indexes Faqs ──────────────────────────────────────────────────────
            var faqIdx = ctx.Faqs.Indexes;
            await faqIdx.CreateOneAsync(
                new CreateIndexModel<FaqItem>(
                    Builders<FaqItem>.IndexKeys.Ascending(f => f.ExternalId),
                    new CreateIndexOptions { Name = "idx_faq_external_id", Unique = true }),
                cancellationToken: ct);

            logger.LogInformation("[MongoDB] Indexes créés avec succès");

            // ── Seed & patch Astuces ──────────────────────────────────────────────
            await SeedAstucesAsync(ctx, logger, ct);
            await PatchAstucesImageUrlAsync(ctx, logger, ct);

            // ── Seed Nouveautés ───────────────────────────────────────────────────
            await SeedNouveautesAsync(ctx, logger, ct);

            // ── Seed FAQ ──────────────────────────────────────────────────────────
            await SeedFaqAsync(ctx, logger, ct);

            logger.LogInformation("[MongoDB] Initialisation terminée — DB: {DbName}", "covoiturage_lacite_logs");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[MongoDB] Erreur lors de l'initialisation");
            throw;
        }
    }

    // ── Seed Astuces ─────────────────────────────────────────────────────────────

    private static async Task SeedAstucesAsync(MongoDbContext ctx, ILogger logger, CancellationToken ct)
    {
        var existing = await ctx.Astuces.CountDocumentsAsync(FilterDefinition<Astuce>.Empty, cancellationToken: ct);
        if (existing > 0)
        {
            logger.LogInformation("[MongoDB] Astuces déjà présentes ({Count}), seed ignoré", existing);
            return;
        }

        var astuces = new List<Astuce>
        {
            new() { ExternalId = "TIP-001", Order = 1, ImageUrl = "/img/astuces.lacite/plan-early.png",               TitleFr = "Planifiez à l'avance",            TitleEn = "Plan ahead",                  DescriptionFr = "Publiez votre trajet 24h à l'avance pour maximiser vos chances d'avoir des passagers.",          DescriptionEn = "Post your trip 24h in advance to maximize your chances of finding passengers." },
            new() { ExternalId = "TIP-002", Order = 2, ImageUrl = "/img/astuces.lacite/be-punctual.png",              TitleFr = "Soyez ponctuel",                  TitleEn = "Be on time",                  DescriptionFr = "La ponctualité est la clé d'une bonne réputation. Votre GoScore en dépend !",                    DescriptionEn = "Punctuality is the key to a good reputation. Your GoScore depends on it!" },
            new() { ExternalId = "TIP-003", Order = 3, ImageUrl = "/img/astuces.lacite/communicate-with-driver.png",  TitleFr = "Communiquez avec vos passagers",  TitleEn = "Communicate with passengers", DescriptionFr = "Utilisez la messagerie intégrée pour confirmer les détails du trajet avant le départ.",          DescriptionEn = "Use the built-in messaging to confirm trip details before departure." },
            new() { ExternalId = "TIP-004", Order = 4, ImageUrl = "/img/astuces.lacite/plan-early.png",               TitleFr = "Vérifiez votre véhicule",         TitleEn = "Check your vehicle",          DescriptionFr = "Assurez-vous que votre voiture est propre et en bon état avant chaque trajet.",                   DescriptionEn = "Make sure your car is clean and in good condition before each trip." },
            new() { ExternalId = "TIP-005", Order = 5, ImageUrl = "/img/astuces.lacite/share-yours-experiences.png", TitleFr = "Laissez un avis",                 TitleEn = "Leave a review",              DescriptionFr = "Les avis renforcent la confiance dans la communauté. Prenez 30 secondes pour évaluer vos covoitureurs.", DescriptionEn = "Reviews build trust in the community. Take 30 seconds to rate your carpoolers." },
            new() { ExternalId = "TIP-006", Order = 6, ImageUrl = "/img/astuces.lacite/be-punctual.png",             TitleFr = "Utilisez les trajets récurrents", TitleEn = "Use recurring trips",         DescriptionFr = "Si vous avez les mêmes horaires chaque semaine, créez un trajet récurrent pour gagner du temps.", DescriptionEn = "If you have the same schedule every week, create a recurring trip to save time." },
            new() { ExternalId = "TIP-007", Order = 7, ImageUrl = "/img/astuces.lacite/communicate-with-driver.png", TitleFr = "Respectez l'itinéraire",          TitleEn = "Follow the route",            DescriptionFr = "Respectez le trajet prévu. Si vous devez dévier, avertissez vos passagers à l'avance.",         DescriptionEn = "Follow the planned route. If you need to deviate, inform your passengers in advance." },
        };

        await ctx.Astuces.InsertManyAsync(astuces, cancellationToken: ct);
        logger.LogInformation("[MongoDB] {Count} astuces insérées", astuces.Count);
    }

    // Patche ImageUrl sur les docs existants qui n'en ont pas (migration one-shot)
    private static readonly Dictionary<string, string> _astuceImageMap = new()
    {
        ["TIP-001"] = "/img/astuces.lacite/plan-early.png",
        ["TIP-002"] = "/img/astuces.lacite/be-punctual.png",
        ["TIP-003"] = "/img/astuces.lacite/communicate-with-driver.png",
        ["TIP-004"] = "/img/astuces.lacite/plan-early.png",
        ["TIP-005"] = "/img/astuces.lacite/share-yours-experiences.png",
        ["TIP-006"] = "/img/astuces.lacite/be-punctual.png",
        ["TIP-007"] = "/img/astuces.lacite/communicate-with-driver.png",
    };

    private static async Task PatchAstucesImageUrlAsync(MongoDbContext ctx, ILogger logger, CancellationToken ct)
    {
        var patched = 0;
        foreach (var (externalId, imageUrl) in _astuceImageMap)
        {
            var filter = Builders<Astuce>.Filter.And(
                Builders<Astuce>.Filter.Eq(a => a.ExternalId, externalId),
                Builders<Astuce>.Filter.Or(
                    Builders<Astuce>.Filter.Eq(a => a.ImageUrl, null),
                    Builders<Astuce>.Filter.Eq(a => a.ImageUrl, "")
                )
            );
            var result = await ctx.Astuces.UpdateOneAsync(filter, Builders<Astuce>.Update.Set(a => a.ImageUrl, imageUrl), cancellationToken: ct);
            if (result.ModifiedCount > 0) patched++;
        }
        if (patched > 0)
            logger.LogInformation("[MongoDB] ImageUrl patché sur {Count} astuces existantes", patched);
    }

    // ── Seed Nouveautés ──────────────────────────────────────────────────────────

    private static async Task SeedNouveautesAsync(MongoDbContext ctx, ILogger logger, CancellationToken ct)
    {
        var existing = await ctx.Nouveautes.CountDocumentsAsync(FilterDefinition<Nouveaute>.Empty, cancellationToken: ct);
        if (existing > 0)
        {
            logger.LogInformation("[MongoDB] Nouveautés déjà présentes ({Count}), seed ignoré", existing);
            return;
        }

        var nouveautes = new List<Nouveaute>
        {
            new()
            {
                ExternalId = "NVT-2026-00001",
                Title = "Lancement de Covoiturage La Cité !",
                VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
                IsPublished = true,
                CreatedAt = new DateTimeOffset(2026, 4, 1, 0, 0, 0, TimeSpan.Zero)
            },
        };

        await ctx.Nouveautes.InsertManyAsync(nouveautes, cancellationToken: ct);
        logger.LogInformation("[MongoDB] {Count} nouveautés insérées", nouveautes.Count);
    }

    // ── Seed FAQ ─────────────────────────────────────────────────────────────────

    private static async Task SeedFaqAsync(MongoDbContext ctx, ILogger logger, CancellationToken ct)
    {
        var existing = await ctx.Faqs.CountDocumentsAsync(FilterDefinition<FaqItem>.Empty, cancellationToken: ct);
        if (existing > 0)
        {
            logger.LogInformation("[MongoDB] FAQ déjà présente ({Count} sections), seed ignoré", existing);
            return;
        }

        // Lire le JSON embarqué dans l'assembly
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("faq-seed.json", StringComparison.OrdinalIgnoreCase));

        if (resourceName is null)
        {
            logger.LogWarning("[MongoDB] Ressource faq-seed.json introuvable — seed FAQ ignoré");
            return;
        }

        await using var stream = assembly.GetManifestResourceStream(resourceName)!;
        var seedItems = await JsonSerializer.DeserializeAsync<List<FaqSeedDto>>(stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, ct);

        if (seedItems is null || seedItems.Count == 0)
        {
            logger.LogWarning("[MongoDB] faq-seed.json vide ou invalide — seed FAQ ignoré");
            return;
        }

        var sections = seedItems.Select(s => new FaqItem
        {
            ExternalId = s.ExternalId,
            SujetFr    = s.SujetFr,
            SujetEn    = s.SujetEn,
            Categorie  = s.Categorie,
            Order      = s.Order,
            IsActive   = true,
            Items      = s.Items.Select(q => new FaqQuestion
            {
                QuestionFr = q.QuestionFr,
                QuestionEn = q.QuestionEn,
                ReponseFr  = q.ReponseFr,
                ReponseEn  = q.ReponseEn,
                Order      = q.Order,
            }).ToList(),
        }).ToList();

        await ctx.Faqs.InsertManyAsync(sections, cancellationToken: ct);
        logger.LogInformation("[MongoDB] {Count} sections FAQ insérées depuis faq-seed.json", sections.Count);
    }

    // DTOs de désérialisation du seed JSON
    private sealed record FaqSeedDto(
        string ExternalId, string SujetFr, string SujetEn, string Categorie, int Order,
        List<FaqQuestionSeedDto> Items);

    private sealed record FaqQuestionSeedDto(
        string QuestionFr, string QuestionEn, string ReponseFr, string ReponseEn, int Order);
}
