namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Onboarding;

// ── Statut d'onboarding retourné au client ──────────────────────────────────
/// <summary>Retourne les flags d'onboarding de l'utilisateur connecté.</summary>
public record OnboardingStatusDto
{
    public Guid UserId { get; init; }
    public bool AlreadySignPolitics { get; init; }
    public bool AlreadySubmittedAllVehiculeDocument { get; init; }
    public bool AlreadySetAProfilePicture { get; init; }
    public bool OnboardingCompleted { get; init; }
    /// <summary>Rôle applicatif actuel (passenger / driver).</summary>
    public string Role { get; init; } = "passenger";
    /// <summary>Rôle institutionnel (étudiant / professeur / administrateur).</summary>
    public string SchoolRole { get; init; } = "Etudiant";
}

// ── Acceptation de la politique d'utilisation ───────────────────────────────
/// <summary>Requête : l'utilisateur accepte la politique d'utilisation.</summary>
public record AcceptPoliticsRequest
{
    public bool Accepted { get; init; }
}

// ── Mise à jour du rôle et du rôle scolaire ─────────────────────────────────
/// <summary>Requête : choix du rôle préféré + rôle scolaire.</summary>
public record SetRoleRequest
{
    /// <summary>"passenger" ou "driver"</summary>
    public string Role { get; init; } = "passenger";
    /// <summary>"Etudiant", "Professeur" ou "Administrateur"</summary>
    public string SchoolRole { get; init; } = "Etudiant";
}

// ── Numéro de téléphone ──────────────────────────────────────────────────────
/// <summary>Requête : saisie du numéro de téléphone.</summary>
public record SetPhoneRequest
{
    public string PhoneNumber { get; init; } = string.Empty;
}

// ── Soumission du véhicule ───────────────────────────────────────────────────
/// <summary>Requête de création du véhicule lors de l'onboarding conducteur.</summary>
public record SubmitVehicleRequest
{
    public string Make { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
    public int Year { get; init; }
    public string Color { get; init; } = string.Empty;
    public string LicensePlate { get; init; } = string.Empty;
    public int Capacity { get; init; } = 4;
}

/// <summary>Réponse après création du véhicule.</summary>
public record SubmitVehicleResponse
{
    public Guid VehicleId { get; init; }
}

// ── Photos du véhicule ───────────────────────────────────────────────────────
/// <summary>Requête : URLs des photos soumises (stockées préalablement sur CDN).</summary>
public record SubmitVehiclePhotosRequest
{
    public Guid VehicleId { get; init; }
    public List<string> PhotoUrls { get; init; } = new();
}

// ── Documents du véhicule ────────────────────────────────────────────────────
/// <summary>Requête : soumission d'un document conducteur (carte grise, assurance, etc.).</summary>
public record SubmitDriverDocumentRequest
{
    public Guid VehicleId { get; init; }
    /// <summary>Type du document : DriversLicense, Insurance, VehicleRegistration, CriminalRecord</summary>
    public string DocumentType { get; init; } = string.Empty;
    public string FileUrl { get; init; } = string.Empty;
    public DateOnly? ExpiryDate { get; init; }
}

// ── Photo de profil ──────────────────────────────────────────────────────────
/// <summary>Requête : URL de la photo de profil (stockée sur CDN).</summary>
public record SetProfilePictureRequest
{
    public string AvatarUrl { get; init; } = string.Empty;
}

// ── Vérification d'identité ──────────────────────────────────────────────────
/// <summary>Requête : 4 photos de vérification d'identité (base64 ou URL CDN).</summary>
public record IdentityVerificationRequest
{
    public string[] Photos { get; init; } = [];
}

// ── Abandon de l'onboarding conducteur ──────────────────────────────────────
/// <summary>L'utilisateur annule l'onboarding conducteur et reste passager.</summary>
public record AbandonDriverOnboardingRequest
{
    // Pas de données nécessaires, juste un signal.
}

/// <summary>Réponse générique d'une étape d'onboarding.</summary>
public record OnboardingStepResult
{
    public bool Success { get; init; } = true;
    public string? Message { get; init; }
}
