namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Pipeda;

// ── Consentement ────────────────────────────────────────────────────────────
public class ConsentementDto
{
    public Guid Id { get; set; }
    public bool ConsentementPartageDonnees { get; set; }
    public bool ConsentementGeolocalisation { get; set; }
    public bool ConsentementMarketing { get; set; }
    public bool ConsentementAnalyseComportement { get; set; }
    public string VersionPolitique { get; set; } = null!;
    public DateTime DateConsentement { get; set; }
}

public class UpdateConsentDto
{
    public bool ConsentementPartageDonnees { get; set; }
    public bool ConsentementGeolocalisation { get; set; }
    public bool ConsentementMarketing { get; set; }
    public bool ConsentementAnalyseComportement { get; set; }
    public string VersionPolitique { get; set; } = null!;
    public string? IpConsentement { get; set; }
}

// ── Export ───────────────────────────────────────────────────────────────────
public class DataExportRequestDto
{
    public Guid ExportId { get; set; }
    public string Statut { get; set; } = "en_attente";
    public DateTime DateDemande { get; set; }
    public string Message { get; set; } = "Votre export sera prêt sous 48h.";
}

public class DataExportStatusDto
{
    public Guid Id { get; set; }
    public string TypeExport { get; set; } = null!;
    public string Statut { get; set; } = null!;
    public DateTime DateDemande { get; set; }
    public DateTime? DateCompletion { get; set; }
    public string? FichierUrl { get; set; }
    public DateTime? DateExpirationLien { get; set; }
}

// ── Anonymisation ───────────────────────────────────────────────────────────
public class AnonymizeAccountDto
{
    public string? Reason { get; set; }
}
