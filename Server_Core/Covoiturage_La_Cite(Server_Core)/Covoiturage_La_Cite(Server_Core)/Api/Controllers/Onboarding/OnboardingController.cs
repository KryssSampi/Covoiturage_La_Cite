using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Onboarding;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Onboarding;

[ApiController]
[Route("api/onboarding")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboarding;

    public OnboardingController(IOnboardingService onboarding)
    {
        _onboarding = onboarding;
    }

    // ── GET /api/onboarding/status ──────────────────────────────────────────
    /// <summary>Retourne l'état d'avancement de l'onboarding de l'utilisateur connecté.</summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken ct)
    {
        var userId = GetUid();
        try
        {
            var status = await _onboarding.GetStatusAsync(userId, ct);
            return Ok(ApiResponse<OnboardingStatusDto>.Ok(status));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/accept-politics ────────────────────────────────
    /// <summary>Étape 1 : L'utilisateur accepte la politique d'utilisation.</summary>
    [HttpPost("accept-politics")]
    public async Task<IActionResult> AcceptPolitics([FromBody] AcceptPoliticsRequest request, CancellationToken ct)
    {
        if (!request.Accepted)
            return BadRequest(ApiResponse.Fail("Vous devez accepter la politique d'utilisation pour continuer."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.AcceptPoliticsAsync(userId, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/set-role ───────────────────────────────────────
    /// <summary>Étape 2 : Choix du rôle préféré et du rôle scolaire.</summary>
    [HttpPost("set-role")]
    public async Task<IActionResult> SetRole([FromBody] SetRoleRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Role))
            return BadRequest(ApiResponse.Fail("Le rôle est requis."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SetRoleAsync(userId, request, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/set-phone ──────────────────────────────────────
    /// <summary>Étape 3 : Saisie du numéro de téléphone.</summary>
    [HttpPost("set-phone")]
    public async Task<IActionResult> SetPhone([FromBody] SetPhoneRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return BadRequest(ApiResponse.Fail("Le numéro de téléphone est requis."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SetPhoneAsync(userId, request, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/submit-vehicle ─────────────────────────────────
    /// <summary>Étape 4 (conducteur) : Création du véhicule.</summary>
    [HttpPost("submit-vehicle")]
    public async Task<IActionResult> SubmitVehicle([FromBody] SubmitVehicleRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Make) || string.IsNullOrWhiteSpace(request.Model))
            return BadRequest(ApiResponse.Fail("La marque et le modèle du véhicule sont requis."));

        if (string.IsNullOrWhiteSpace(request.LicensePlate))
            return BadRequest(ApiResponse.Fail("La plaque d'immatriculation est requise."));

        if (request.Year < 1980 || request.Year > DateTimeOffset.UtcNow.Year + 1)
            return BadRequest(ApiResponse.Fail("L'année du véhicule est invalide."));

        if (request.Capacity < 1 || request.Capacity > 8)
            return BadRequest(ApiResponse.Fail("La capacité doit être entre 1 et 8 passagers."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SubmitVehicleAsync(userId, request, ct);
            return Ok(ApiResponse<SubmitVehicleResponse>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/submit-vehicle-photos ──────────────────────────
    /// <summary>Étape 5 (conducteur) : Photos du véhicule (max 6).</summary>
    [HttpPost("submit-vehicle-photos")]
    public async Task<IActionResult> SubmitVehiclePhotos([FromBody] SubmitVehiclePhotosRequest request, CancellationToken ct)
    {
        if (request.PhotoUrls == null || request.PhotoUrls.Count == 0)
            return BadRequest(ApiResponse.Fail("Au moins une photo est requise."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SubmitVehiclePhotosAsync(userId, request, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // ── POST /api/onboarding/submit-document ────────────────────────────────
    /// <summary>Étape 6 (conducteur) : Soumission d'un document conducteur.</summary>
    [HttpPost("submit-document")]
    public async Task<IActionResult> SubmitDocument([FromBody] SubmitDriverDocumentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.FileUrl))
            return BadRequest(ApiResponse.Fail("L'URL du document est requise."));

        if (string.IsNullOrWhiteSpace(request.DocumentType))
            return BadRequest(ApiResponse.Fail("Le type de document est requis."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SubmitDriverDocumentAsync(userId, request, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/set-profile-picture ────────────────────────────
    /// <summary>Étape finale : Photo de profil. Marque l'onboarding comme terminé.</summary>
    [HttpPost("set-profile-picture")]
    public async Task<IActionResult> SetProfilePicture([FromBody] SetProfilePictureRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.AvatarUrl))
            return BadRequest(ApiResponse.Fail("L'URL de la photo de profil est requise."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SetProfilePictureAsync(userId, request, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/identity-verification ─────────────────────────
    /// <summary>Soumet les 4 photos de vérification d'identité (face, droite, gauche, menton levé).</summary>
    [HttpPost("identity-verification")]
    public async Task<IActionResult> SubmitIdentityVerification([FromBody] IdentityVerificationRequest request, CancellationToken ct)
    {
        if (request.Photos == null || request.Photos.Length < 4)
            return BadRequest(ApiResponse.Fail("4 photos sont requises pour la vérification d'identité."));

        var userId = GetUid();
        try
        {
            var result = await _onboarding.SubmitIdentityVerificationAsync(userId, request.Photos, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/onboarding/abandon-driver ─────────────────────────────────
    /// <summary>L'utilisateur abandonne l'onboarding conducteur et reste passager.</summary>
    [HttpPost("abandon-driver")]
    public async Task<IActionResult> AbandonDriver(CancellationToken ct)
    {
        var userId = GetUid();
        try
        {
            var result = await _onboarding.AbandonDriverOnboardingAsync(userId, ct);
            return Ok(ApiResponse<OnboardingStepResult>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    // ── Helper ─────────────────────────────────────────────────────────────
    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
