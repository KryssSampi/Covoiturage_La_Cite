using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Onboarding;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using VehicleEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.Vehicle;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Onboarding;

public class OnboardingService : IOnboardingService
{
    private readonly IUserRepository _userRepo;
    private readonly IVehiculeRepository _vehicleRepo;
    private readonly AppDbContext _db;
    private readonly ILogger<OnboardingService> _logger;
    private readonly INotificationService _notifications;

    // Documents obligatoires pour un conducteur (hors ProfilePhoto)
    private static readonly DocumentType[] RequiredDriverDocs =
    [
        DocumentType.DriversLicense,
        DocumentType.Insurance,
        DocumentType.VehicleRegistration,
        DocumentType.CriminalRecord,
    ];

    public OnboardingService(
        IUserRepository userRepo,
        IVehiculeRepository vehicleRepo,
        AppDbContext db,
        ILogger<OnboardingService> logger,
        INotificationService notifications)
    {
        _userRepo = userRepo;
        _vehicleRepo = vehicleRepo;
        _db = db;
        _logger = logger;
        _notifications = notifications;
    }

    // ── Statut ─────────────────────────────────────────────────────────────
    public async Task<OnboardingStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        return MapToStatusDto(user);
    }

    // ── Étape 1 : Politique d'utilisation ──────────────────────────────────
    public async Task<OnboardingStepResult> AcceptPoliticsAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        user.AlreadySignPolitics = true;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);

        _logger.LogInformation("Utilisateur {UserId} a accepté la politique d'utilisation.", userId);
        return new OnboardingStepResult { Success = true };
    }

    // ── Étape 2 : Rôle et rôle scolaire ────────────────────────────────────
    public async Task<OnboardingStepResult> SetRoleAsync(Guid userId, SetRoleRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        user.Role = request.Role.ToLowerInvariant() switch
        {
            "driver" => UserRole.Driver,
            _ => UserRole.Passenger,
        };

        user.CanBeDriver = user.Role == UserRole.Driver;

        user.SchoolRole = request.SchoolRole switch
        {
            "Professeur" => SchoolRole.Professeur,
            "Administrateur" => SchoolRole.Administrateur,
            _ => SchoolRole.Etudiant,
        };

        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);

        // Notifier l'utilisateur si le mode conducteur est activé
        if (user.CanBeDriver)
        {
            try
            {
                await _notifications.CreateAsync(new CreateNotificationDto
                {
                    UserId      = userId,
                    Type        = NotificationType.System,
                    Title       = "Mode conducteur activé !",
                    Body        = "Vous êtes maintenant en mode conducteur. Soumettez vos documents (permis, assurance, carte grise) pour commencer à proposer des trajets.",
                    IsImportant = true,
                    DeepLink    = "/onboarding/documents",
                }, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[OnboardingService] Erreur notification conducteur — {UserId}", userId);
            }
        }

        _logger.LogInformation("Utilisateur {UserId} a défini son rôle : {Role} / {SchoolRole}.",
            userId, user.Role, user.SchoolRole);

        return new OnboardingStepResult { Success = true };
    }

    // ── Étape 3 : Numéro de téléphone ──────────────────────────────────────
    public async Task<OnboardingStepResult> SetPhoneAsync(Guid userId, SetPhoneRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        user.PhoneNumber = request.PhoneNumber.Trim();
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);

        return new OnboardingStepResult { Success = true };
    }

    // ── Étape 4 : Véhicule ─────────────────────────────────────────────────
    public async Task<SubmitVehicleResponse> SubmitVehicleAsync(Guid userId, SubmitVehicleRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        // Créer le DriverProfile si absent
        if (user.DriverProfile == null)
        {
            var profile = new DriverProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ValidationStatus = DriverValidationStatus.Pending,
            };
            _db.DriverProfiles.Add(profile);
            await _db.SaveChangesAsync(ct);

            // Re-charger pour avoir accès au profil
            user = await _userRepo.GetWithProfileAsync(userId, ct)!;
        }

        var existing = await _vehicleRepo.GetByLicensePlateAsync(request.LicensePlate, ct);
        if (existing != null)
            throw new InvalidOperationException("Une plaque d'immatriculation identique est déjà enregistrée.");

        var now = DateTimeOffset.UtcNow;
        var vehicle = new VehicleEntity
        {
            Id = Guid.NewGuid(),
            DriverProfileId = user.DriverProfile!.Id,
            Make = request.Make.Trim(),
            Model = request.Model.Trim(),
            Year = request.Year,
            Color = request.Color.Trim(),
            LicensePlate = request.LicensePlate.Trim().ToUpperInvariant(),
            Capacity = request.Capacity,
            IsActive = true,
            IsDefault = true,
            Verified = false,           // en attente de vérification admin
            CreatedAt = now,
            UpdatedAt = now,
        };

        await _vehicleRepo.AddAsync(vehicle, ct);

        _logger.LogInformation("Véhicule {VehicleId} créé pour l'utilisateur {UserId} (non vérifié).", vehicle.Id, userId);

        return new SubmitVehicleResponse { VehicleId = vehicle.Id };
    }

    // ── Étape 5 : Photos du véhicule ───────────────────────────────────────
    public async Task<OnboardingStepResult> SubmitVehiclePhotosAsync(Guid userId, SubmitVehiclePhotosRequest request, CancellationToken ct = default)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(request.VehicleId, ct)
            ?? throw new KeyNotFoundException($"Véhicule {request.VehicleId} introuvable.");

        // Vérifier que le véhicule appartient à l'utilisateur
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        if (user.DriverProfile == null || vehicle.DriverProfileId != user.DriverProfile.Id)
            throw new UnauthorizedAccessException("Ce véhicule ne vous appartient pas.");

        vehicle.VehiclePhotoUrls = request.PhotoUrls.Take(6).ToList();
        vehicle.UpdatedAt = DateTimeOffset.UtcNow;
        await _vehicleRepo.UpdateAsync(vehicle, ct);

        return new OnboardingStepResult { Success = true };
    }

    // ── Étape 6 : Document conducteur ──────────────────────────────────────
    public async Task<OnboardingStepResult> SubmitDriverDocumentAsync(Guid userId, SubmitDriverDocumentRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        if (user.DriverProfile == null)
            throw new InvalidOperationException("Profil conducteur introuvable. Soumettez d'abord votre véhicule.");

        if (!Enum.TryParse<DocumentType>(request.DocumentType, ignoreCase: true, out var docType))
            throw new ArgumentException($"Type de document invalide : {request.DocumentType}");

        // Upsert : remplacer si le type existe déjà
        var existing = user.DriverProfile.Documents
            .FirstOrDefault(d => d.DocumentType == docType);

        if (existing != null)
        {
            existing.FileUrl = request.FileUrl;
            existing.ExpiryDate = request.ExpiryDate;
            existing.Status = "pending";
            existing.SubmittedAt = DateTimeOffset.UtcNow;
            existing.ReviewedAt = null;
            existing.AdminNote = null;
            _db.DriverDocuments.Update(existing);
        }
        else
        {
            _db.DriverDocuments.Add(new DriverDocument
            {
                Id = Guid.NewGuid(),
                DriverProfileId = user.DriverProfile.Id,
                DocumentType = docType,
                FileUrl = request.FileUrl,
                ExpiryDate = request.ExpiryDate,
                Status = "pending",
                SubmittedAt = DateTimeOffset.UtcNow,
            });
        }

        await _db.SaveChangesAsync(ct);

        // Vérifier si tous les documents obligatoires sont soumis
        var submittedTypes = user.DriverProfile.Documents
            .Select(d => d.DocumentType)
            .ToHashSet();
        submittedTypes.Add(docType); // inclure celui qu'on vient de soumettre

        if (RequiredDriverDocs.All(d => submittedTypes.Contains(d)))
        {
            user.AlreadySubmittedAllVehiculeDocument = true;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _userRepo.UpdateAsync(user, ct);
        }

        _logger.LogInformation("Document {DocType} soumis pour l'utilisateur {UserId}.", docType, userId);

        return new OnboardingStepResult { Success = true };
    }

    // ── Étape finale : Photo de profil ─────────────────────────────────────
    public async Task<OnboardingStepResult> SetProfilePictureAsync(Guid userId, SetProfilePictureRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        // Un conducteur doit avoir soumis tous ses documents obligatoires avant de terminer
        if (user.Role == UserRole.Driver && !user.AlreadySubmittedAllVehiculeDocument)
        {
            _logger.LogWarning("Conducteur {UserId} a tenté de terminer l'onboarding sans avoir soumis tous ses documents.", userId);
            return new OnboardingStepResult
            {
                Success = false,
                Message = "documents_required",
            };
        }

        user.AvatarUrl = request.AvatarUrl;
        user.AlreadySetAProfilePicture = true;
        user.OnboardingCompleted = true;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);

        _logger.LogInformation("Photo de profil définie pour {UserId}. Onboarding terminé.", userId);

        return new OnboardingStepResult { Success = true, Message = "Onboarding terminé." };
    }

    // ── Étape : Vérification d'identité ───────────────────────────────────
    public async Task<OnboardingStepResult> SubmitIdentityVerificationAsync(Guid userId, string[] photos, CancellationToken ct = default)
    {
        if (photos == null || photos.Length == 0)
            return new OnboardingStepResult { Success = false, Message = "Aucune photo fournie." };

        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        user.IdentityVerificationPhotos = photos;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);

        _logger.LogInformation("Vérification d'identité soumise pour {UserId} ({Count} photos).", userId, photos.Length);

        return new OnboardingStepResult { Success = true, Message = "Photos de vérification enregistrées." };
    }

    // ── Abandon de l'onboarding conducteur ────────────────────────────────
    public async Task<OnboardingStepResult> AbandonDriverOnboardingAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Utilisateur {userId} introuvable.");

        user.Role = UserRole.Passenger;
        user.CanBeDriver = false;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);

        _logger.LogInformation("Utilisateur {UserId} a abandonné l'onboarding conducteur. Rôle : Passager.", userId);

        return new OnboardingStepResult { Success = true, Message = "Vous continuez en tant que passager." };
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private static OnboardingStatusDto MapToStatusDto(Domain.Entities.User user) => new()
    {
        UserId = user.Id,
        AlreadySignPolitics = user.AlreadySignPolitics,
        AlreadySubmittedAllVehiculeDocument = user.AlreadySubmittedAllVehiculeDocument,
        AlreadySetAProfilePicture = user.AlreadySetAProfilePicture,
        OnboardingCompleted = user.OnboardingCompleted,
        Role = user.Role.ToString().ToLower(),
        SchoolRole = user.SchoolRole.ToString(),
    };
}
