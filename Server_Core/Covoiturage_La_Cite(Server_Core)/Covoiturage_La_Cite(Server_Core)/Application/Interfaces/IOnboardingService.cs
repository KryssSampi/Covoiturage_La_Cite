using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Onboarding;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IOnboardingService
{
    /// <summary>Retourne les flags d'onboarding de l'utilisateur.</summary>
    Task<OnboardingStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Étape 1 — Politique d'utilisation acceptée.</summary>
    Task<OnboardingStepResult> AcceptPoliticsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Étape 2 — Rôle préféré (passager/conducteur) + rôle scolaire.</summary>
    Task<OnboardingStepResult> SetRoleAsync(Guid userId, SetRoleRequest request, CancellationToken ct = default);

    /// <summary>Étape 3 — Numéro de téléphone.</summary>
    Task<OnboardingStepResult> SetPhoneAsync(Guid userId, SetPhoneRequest request, CancellationToken ct = default);

    /// <summary>Étape 4 (conducteur) — Création du véhicule.</summary>
    Task<SubmitVehicleResponse> SubmitVehicleAsync(Guid userId, SubmitVehicleRequest request, CancellationToken ct = default);

    /// <summary>Étape 5 (conducteur) — Photos du véhicule.</summary>
    Task<OnboardingStepResult> SubmitVehiclePhotosAsync(Guid userId, SubmitVehiclePhotosRequest request, CancellationToken ct = default);

    /// <summary>Étape 6 (conducteur) — Soumission d'un document conducteur.</summary>
    Task<OnboardingStepResult> SubmitDriverDocumentAsync(Guid userId, SubmitDriverDocumentRequest request, CancellationToken ct = default);

    /// <summary>Étape finale — Photo de profil.</summary>
    Task<OnboardingStepResult> SetProfilePictureAsync(Guid userId, SetProfilePictureRequest request, CancellationToken ct = default);

    /// <summary>Étape finale (optionnelle) — Soumission des photos pour vérification d'identité.</summary>
    /// <summary>Vérification d'identité — 4 photos de visage (face, droite, gauche, menton).</summary>
    Task<OnboardingStepResult> SubmitIdentityVerificationAsync(Guid userId, string[] photos, CancellationToken ct = default);

    /// <summary>Abandon de l'onboarding conducteur : l'utilisateur reste passager.</summary>
    Task<OnboardingStepResult> AbandonDriverOnboardingAsync(Guid userId, CancellationToken ct = default);
}
