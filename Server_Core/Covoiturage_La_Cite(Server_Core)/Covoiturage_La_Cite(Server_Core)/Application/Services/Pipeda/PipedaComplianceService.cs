using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Pipeda;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.Models;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Pipeda;

public class PipedaComplianceService : IPipedaComplianceService
{
    private readonly IConsentementRepository _consentRepo;
    private readonly IDataExportRepository _exportRepo;
    private readonly AppDbContext _db;
    private readonly ILogger<PipedaComplianceService> _logger;

    public PipedaComplianceService(
        IConsentementRepository consentRepo,
        IDataExportRepository exportRepo,
        AppDbContext db,
        ILogger<PipedaComplianceService> logger)
    {
        _consentRepo = consentRepo;
        _exportRepo = exportRepo;
        _db = db;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSENTEMENTS
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<ConsentementDto> GetConsentAsync(Guid userId, CancellationToken ct)
    {
        var consent = await _consentRepo.GetByUserAsync(userId, ct);
        if (consent == null)
            throw new KeyNotFoundException("Aucun consentement trouvé pour cet utilisateur");

        return MapConsent(consent);
    }

    public async Task<ConsentementDto> UpdateConsentAsync(Guid userId, UpdateConsentDto dto, CancellationToken ct)
    {
        var existing = await _consentRepo.GetByUserAndVersionAsync(userId, dto.VersionPolitique, ct);

        if (existing != null)
        {
            existing.ConsentementPartageDonnees = dto.ConsentementPartageDonnees;
            existing.ConsentementGeolocalisation = dto.ConsentementGeolocalisation;
            existing.ConsentementMarketing = dto.ConsentementMarketing;
            existing.ConsentementAnalyseComportement = dto.ConsentementAnalyseComportement;
            existing.IpConsentement = dto.IpConsentement;
            existing.UpdatedAt = DateTime.UtcNow;
            await _consentRepo.UpdateAsync(existing, ct);
            return MapConsent(existing);
        }

        var consent = new ConsentementsPipedum
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ConsentementPartageDonnees = dto.ConsentementPartageDonnees,
            ConsentementGeolocalisation = dto.ConsentementGeolocalisation,
            ConsentementMarketing = dto.ConsentementMarketing,
            ConsentementAnalyseComportement = dto.ConsentementAnalyseComportement,
            VersionPolitique = dto.VersionPolitique,
            DateConsentement = DateTime.UtcNow,
            IpConsentement = dto.IpConsentement,
            UpdatedAt = DateTime.UtcNow
        };

        await _consentRepo.AddAsync(consent, ct);
        return MapConsent(consent);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT DE DONNÉES (DROIT D'ACCÈS PIPEDA)
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<DataExportRequestDto> RequestDataExportAsync(Guid userId, string? ipAddress, CancellationToken ct)
    {
        var export = new ExportsDonnee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TypeExport = "complet",
            Statut = "en_attente",
            DateDemande = DateTime.UtcNow
        };

        await _exportRepo.AddAsync(export, ct);
        _logger.LogInformation("Demande d'export PIPEDA créée: UserId={UserId}, ExportId={ExportId}", userId, export.Id);

        return new DataExportRequestDto
        {
            ExportId = export.Id,
            Statut = export.Statut,
            DateDemande = export.DateDemande,
            Message = "Votre export sera prêt sous 48h. Un lien de téléchargement vous sera envoyé par courriel."
        };
    }

    public async Task<List<DataExportStatusDto>> GetMyExportsAsync(Guid userId, CancellationToken ct)
    {
        var exports = await _exportRepo.GetByUserAsync(userId, ct);
        return exports.Select(e => new DataExportStatusDto
        {
            Id = e.Id,
            TypeExport = e.TypeExport,
            Statut = e.Statut,
            DateDemande = e.DateDemande,
            DateCompletion = e.DateCompletion,
            FichierUrl = e.FichierUrl,
            DateExpirationLien = e.DateExpirationLien
        }).ToList();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ANONYMISATION (DROIT À L'EFFACEMENT)
    // ═══════════════════════════════════════════════════════════════════════
    public async Task AnonymizeAccountAsync(Guid userId, string? reason, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        // Anonymiser les données nominatives (PIPEDA)
        var anonymizedEmail = $"anonymized_{userId:N}@deleted.local";
        user.Email = anonymizedEmail;
        user.FirstName = "Utilisateur";
        user.LastName = "Supprimé";
        user.PhoneNumber = null;
        user.AvatarUrl = null;
        user.Bio = null;
        user.MicrosoftSsoId = string.Empty;
        user.DeletedAt = DateTimeOffset.UtcNow;

        _db.Users.Update(user);

        // Supprimer les positions GPS (pas d'obligation de rétention)
        await _db.GpsPositions
            .Where(g => g.UserId == userId)
            .ExecuteDeleteAsync(ct);

        // Supprimer les notifications
        await _db.Notifications
            .Where(n => n.UserId == userId)
            .ExecuteDeleteAsync(ct);

        // Révoquer les certificats de sécurité
        await _db.ClientCertificates
            .Where(c => c.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.Status, "revoked"), ct);

        // Révoquer les sessions web
        await _db.WebSessionKeys
            .Where(k => k.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(k => k.Status, "revoked"), ct);

        await _db.SaveChangesAsync(ct);

        // NOTE: Les transactions et audits sont conservés 7 ans (obligation légale)
        _logger.LogWarning("Compte anonymisé (PIPEDA): UserId={UserId} Reason={Reason}", userId, reason ?? "non spécifiée");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TRAITEMENT BATCH (HANGFIRE)
    // ═══════════════════════════════════════════════════════════════════════
    public async Task ProcessPendingExportsAsync(CancellationToken ct)
    {
        var pending = await _exportRepo.GetPendingExportsAsync(ct);

        foreach (var export in pending)
        {
            try
            {
                export.Statut = "en_cours";
                await _exportRepo.UpdateAsync(export, ct);

                // TODO: Générer le fichier ZIP avec toutes les données personnelles
                // (profil, trajets, transactions, reviews, consentements, GPS, etc.)
                // et l'uploader vers un storage sécurisé avec lien temporaire 7 jours

                export.Statut = "termine";
                export.DateCompletion = DateTime.UtcNow;
                export.DateExpirationLien = DateTime.UtcNow.AddDays(7);
                // export.FichierUrl = uploadedUrl;

                await _exportRepo.UpdateAsync(export, ct);
                _logger.LogInformation("Export PIPEDA traité: ExportId={Id}", export.Id);
            }
            catch (Exception ex)
            {
                export.Statut = "erreur";
                await _exportRepo.UpdateAsync(export, ct);
                _logger.LogError(ex, "Erreur traitement export PIPEDA: ExportId={Id}", export.Id);
            }
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────────────
    private static ConsentementDto MapConsent(ConsentementsPipedum c) => new()
    {
        Id = c.Id,
        ConsentementPartageDonnees = c.ConsentementPartageDonnees,
        ConsentementGeolocalisation = c.ConsentementGeolocalisation,
        ConsentementMarketing = c.ConsentementMarketing,
        ConsentementAnalyseComportement = c.ConsentementAnalyseComportement,
        VersionPolitique = c.VersionPolitique,
        DateConsentement = c.DateConsentement
    };
}
