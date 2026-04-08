using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.User;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly MicrosoftSsoService _ssoService;
    private readonly TokenService _tokenService;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _db;
    private readonly ILogger<UserService> _logger;

    // GoScore de départ offert à chaque nouveau membre
    private const int InitialGoScore = 250;

    public UserService(
        IUserRepository userRepository,
        MicrosoftSsoService ssoService,
        TokenService tokenService,
        INotificationService notificationService,
        AppDbContext db,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _ssoService = ssoService;
        _tokenService = tokenService;
        _notificationService = notificationService;
        _db = db;
        _logger = logger;
    }

    // ── Auth SSO ─────────────────────────────────────────────────────────────

    public async Task<AuthResultDto> AuthenticateWithSsoAsync(string microsoftIdToken, CancellationToken ct = default)
    {
        var msUser = await _ssoService.ValidateTokenAsync(microsoftIdToken)
            ?? throw new UnauthorizedAccessException("Token Microsoft invalide ou expiré");

        var isNew = false;
        var user = await _userRepository.GetByMicrosoftIdAsync(msUser.ObjectId, ct);

        if (user == null)
        {
            // Nouvel utilisateur — auto-création
            user = new Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                Email = msUser.Email,
                MicrosoftSsoId = msUser.ObjectId,
                FirstName = msUser.FirstName,
                LastName = msUser.LastName,
                AvatarUrl = msUser.AvatarUrl,
                Role = UserRole.Passenger,
                SchoolRole = SchoolRole.Etudiant,
                Status = UserStatus.Active,
                Language = "fr",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            user.GoScore = InitialGoScore;
            await _userRepository.AddAsync(user, ct);
            isNew = true;
            _logger.LogInformation("Nouvel utilisateur créé: {Email}", user.Email);
        }

        // Vérifier que le compte est actif
        if (user.Status == UserStatus.Suspended)
            throw new UnauthorizedAccessException("Compte suspendu");
        if (user.Status == UserStatus.Banned)
            throw new UnauthorizedAccessException("Compte banni");
        if (user.Status == UserStatus.Deleted)
            throw new UnauthorizedAccessException("Compte supprimé");

        var token = _tokenService.GenerateToken(user);

        if (isNew)
            _ = Task.Run(() => SendWelcomeNotificationsAsync(user, ct), ct);

        return new AuthResultDto
        {
            AccessToken = token,
            ExpiresAt = user.Role == UserRole.Admin
                ? DateTimeOffset.UtcNow.AddHours(2)
                : DateTimeOffset.UtcNow.AddDays(30),
            User = new UserSummaryDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.ToString().ToLower(),
                SchoolRole = user.SchoolRole.ToString().ToLower(),
                CanBeDriver = user.CanBeDriver,
                AlreadySignPolitics = user.AlreadySignPolitics,
                AlreadySubmittedAllVehiculeDocument = user.AlreadySubmittedAllVehiculeDocument,
                AlreadySetAProfilePicture = user.AlreadySetAProfilePicture,
                OnboardingCompleted = user.OnboardingCompleted,
            },
            IsNewUser = isNew
        };
    }

    // ── Auth Test Mode (ISTESTMODE=true) ─────────────────────────────────────

    public async Task<AuthResultDto> AuthenticateWithEmailTestModeAsync(string email, CancellationToken ct = default)
    {
        email = email.Trim().ToLower();

        if (!email.EndsWith("@collegelacite.ca") && !email.EndsWith("@lacitec.on.ca"))
            throw new UnauthorizedAccessException("Email institutionnel du Collège La Cité requis");

        var isNew = false;
        var user = await _userRepository.GetByEmailAsync(email, ct);

        if (user == null)
        {
            // Auto-création : première connexion en mode test
            var localPart = email.Split('@')[0];
            user = new Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                Email = email,
                MicrosoftSsoId = $"testmode_{email}",
                FirstName = localPart,
                LastName = "TestMode",
                Role = UserRole.Passenger,
                SchoolRole = SchoolRole.Etudiant,
                Status = UserStatus.Active,
                Language = "fr",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            user.GoScore = InitialGoScore;
            await _userRepository.AddAsync(user, ct);
            isNew = true;
            _logger.LogInformation("[TESTMODE] Nouvel utilisateur test créé: {Email}", email);
        }

        if (user.Status == UserStatus.Suspended)
            throw new UnauthorizedAccessException("Compte suspendu");
        if (user.Status == UserStatus.Banned)
            throw new UnauthorizedAccessException("Compte banni");

        var token = _tokenService.GenerateToken(user);

        if (isNew)
            _ = Task.Run(() => SendWelcomeNotificationsAsync(user, ct), ct);

        return new AuthResultDto
        {
            AccessToken = token,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(30),
            User = new UserSummaryDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.ToString().ToLower(),
                SchoolRole = user.SchoolRole.ToString().ToLower(),
                CanBeDriver = user.CanBeDriver,
                AlreadySignPolitics = user.AlreadySignPolitics,
                AlreadySubmittedAllVehiculeDocument = user.AlreadySubmittedAllVehiculeDocument,
                AlreadySetAProfilePicture = user.AlreadySetAProfilePicture,
                OnboardingCompleted = user.OnboardingCompleted,
            },
            IsNewUser = isNew
        };
    }

    // ── Profil ───────────────────────────────────────────────────────────────

    public async Task<UserResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _userRepository.GetWithProfileAsync(id, ct);
        return user == null ? null : MapToResponse(user);
    }

    public async Task<UserResponseDto?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
        => await GetByIdAsync(userId, ct);

    public async Task<UserPublicDto?> GetPublicProfileAsync(Guid id, Guid? requesterId = null, CancellationToken ct = default)
    {
        var user = await _userRepository.GetPublicProfileAsync(id, ct);
        if (user == null) return null;

        // Likes
        var likesCount = await _db.UserLikes.CountAsync(l => l.LikedId == id, ct);
        var isLiked = requesterId.HasValue && await _db.UserLikes
            .AnyAsync(l => l.LikerId == requesterId && l.LikedId == id, ct);

        // Favori (affinité)
        var isFavorite = requesterId.HasValue && await _db.Affinities
            .AnyAsync(a => a.UserId == requesterId && a.TargetUserId == id && a.IsActuallyFavorite, ct);

        // Avis récents (5 derniers, publiés)
        var reviews = await _db.Reviews
            .Where(r => r.RevieweeId == id && r.IsPublished)
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .Include(r => r.Reviewer)
            .ToListAsync(ct);

        // Trajets publiés récents — conducteur seulement
        var recentTrips = user.CanBeDriver
            ? await _db.Trips
                .Where(t => t.DriverId == id && t.Status == Domain.Enums.TripStatus.Published)
                .OrderByDescending(t => t.DepartureDate)
                .Take(5)
                .ToListAsync(ct)
            : [];

        // Trajets récurrents habituels (itinéraires distincts parmi les trajets complétés)
        var usualTrips = user.CanBeDriver
            ? await _db.Trips
                .Where(t => t.DriverId == id && t.Status == Domain.Enums.TripStatus.Completed)
                .GroupBy(t => new { t.DepartureLabel, t.ArrivalLabel })
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new UsualTripDto
                {
                    DepartureLabel = g.Key.DepartureLabel,
                    ArrivalLabel = g.Key.ArrivalLabel
                })
                .ToListAsync(ct)
            : [];

        // Véhicule principal
        var vehicle = user.DriverProfile?.Vehicles.FirstOrDefault(v => v.IsDefault)
                   ?? user.DriverProfile?.Vehicles.FirstOrDefault();

        return new UserPublicDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            IsProfileVerified = user.IsProfileVerified,
            CanBeDriver = user.CanBeDriver,
            SchoolRole = user.SchoolRole,
            Role = user.Role,
            GoScore = user.GoScore,
            LanguagesSpoken = user.LanguagesSpoken.Length > 0 ? user.LanguagesSpoken : [user.Language],
            CreatedAt = user.CreatedAt,
            LikesCount = likesCount,
            IsLikedByMe = isLiked,
            IsFavorite = isFavorite,
            DriverProfile = user.DriverProfile == null ? null : new DriverProfilePublicDto
            {
                ValidationStatus = user.DriverProfile.ValidationStatus.ToString().ToLower(),
                AverageRating = user.DriverProfile.AverageRating,
                TotalTripsAsDriver = user.DriverProfile.TotalTripsAsDriver,
                Co2SavedKg = user.DriverProfile.Co2SavedKg,
                VehiclePhotoUrl = vehicle?.PhotoUrl,
                VehicleMake = vehicle?.Make,
                VehicleModel = vehicle?.Model,
                VehicleYear = vehicle?.Year,
                VehicleColor = vehicle?.Color
            },
            RecentReviews = reviews.Select(r => new PublicReviewDto
            {
                ReviewerName = $"{r.Reviewer.FirstName} {r.Reviewer.LastName[0]}.",
                ReviewerAvatar = r.Reviewer.AvatarUrl,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }),
            RecentPublishedTrips = recentTrips.Select(t => new PublicTripDto
            {
                Id = t.Id,
                DepartureLabel = t.DepartureLabel,
                ArrivalLabel = t.ArrivalLabel,
                DepartureDate = t.DepartureDate,
                DepartureTime = t.DepartureTime,
                AvailableSeats = t.MaxPassengers - t.CurrentPassengers,
                PricePerPassenger = t.PricePerPassenger
            }),
            UsualTrips = usualTrips
        };
    }

    public async Task<(bool isLiked, int count)> ToggleLikeAsync(Guid likerId, Guid likedId, CancellationToken ct = default)
    {
        var existing = await _db.UserLikes
            .FirstOrDefaultAsync(l => l.LikerId == likerId && l.LikedId == likedId, ct);

        if (existing != null)
        {
            _db.UserLikes.Remove(existing);
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            _db.UserLikes.Add(new UserLike
            {
                Id = Guid.NewGuid(),
                LikerId = likerId,
                LikedId = likedId,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await _db.SaveChangesAsync(ct);
        }

        var count = await _db.UserLikes.CountAsync(l => l.LikedId == likedId, ct);
        return (existing == null, count); // isLiked = true si on vient d'ajouter
    }

    public async Task<SurveyTripAlertDto> CreateSurveyAlertAsync(Guid userId, CreateSurveyAlertDto dto, CancellationToken ct = default)
    {
        // Idempotent : ne crée pas de doublon pour le même itinéraire + conducteur
        var existing = await _db.SurveyTripAlerts.FirstOrDefaultAsync(s =>
            s.UserId == userId && s.DriverId == dto.DriverId &&
            s.DepartureLabel == dto.DepartureLabel && s.ArrivalLabel == dto.ArrivalLabel &&
            s.IsActive, ct);

        if (existing != null)
            return MapSurveyAlert(existing);

        var alert = new SurveyTripAlert
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DriverId = dto.DriverId,
            DriverName = dto.DriverName,
            DepartureLabel = dto.DepartureLabel,
            ArrivalLabel = dto.ArrivalLabel,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.SurveyTripAlerts.Add(alert);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("SurveyTripAlert créée pour {UserId} → driver {DriverId}", userId, dto.DriverId);
        return MapSurveyAlert(alert);
    }

    public async Task<SurveyTripAlertDto> ToggleSurveyAlertAsync(Guid userId, Guid alertId, CancellationToken ct = default)
    {
        var alert = await _db.SurveyTripAlerts
            .FirstOrDefaultAsync(s => s.Id == alertId && s.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Alerte introuvable ou accès refusé");

        alert.IsActive = !alert.IsActive;
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("SurveyTripAlert {AlertId} toggle → IsActive={IsActive}", alertId, alert.IsActive);
        return MapSurveyAlert(alert);
    }

    public async Task DeleteSurveyAlertAsync(Guid userId, Guid alertId, CancellationToken ct = default)
    {
        var alert = await _db.SurveyTripAlerts
            .FirstOrDefaultAsync(s => s.Id == alertId && s.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Alerte introuvable ou accès refusé");

        _db.SurveyTripAlerts.Remove(alert);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("SurveyTripAlert {AlertId} supprimée par {UserId}", alertId, userId);
    }

    private static SurveyTripAlertDto MapSurveyAlert(SurveyTripAlert a) => new()
    {
        Id = a.Id,
        DriverId = a.DriverId,
        DriverName = a.DriverName,
        DepartureLabel = a.DepartureLabel,
        ArrivalLabel = a.ArrivalLabel,
        IsActive = a.IsActive,
        CreatedAt = a.CreatedAt
    };

    public async Task<UserResponseDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto, CancellationToken ct = default)
    {
        var user = await _userRepository.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;
        if (dto.Bio != null) user.Bio = dto.Bio;
        if (dto.Language != null) user.Language = dto.Language;
        if (dto.LanguagesSpoken != null) user.LanguagesSpoken = dto.LanguagesSpoken;

        if (dto.Preferences != null && user.Preferences != null)
        {
            if (dto.Preferences.MusicAccepted.HasValue)
                user.Preferences.MusicAccepted = dto.Preferences.MusicAccepted.Value;
            if (dto.Preferences.PetsAccepted.HasValue)
                user.Preferences.HasPets = dto.Preferences.PetsAccepted.Value;
            if (dto.Preferences.SmokingAccepted.HasValue)
                user.Preferences.SmokesRegularly = dto.Preferences.SmokingAccepted.Value;
            if (dto.Preferences.ConversationLevel != null
                && Enum.TryParse<ConversationLevel>(dto.Preferences.ConversationLevel, true, out var level))
                user.Preferences.ConversationLevel = level;
            if (dto.Preferences.EmailPrimordiales.HasValue) user.Preferences.EmailPrimordiales = dto.Preferences.EmailPrimordiales.Value;
            if (dto.Preferences.EmailSecondaires.HasValue) user.Preferences.EmailSecondaires = dto.Preferences.EmailSecondaires.Value;
            if (dto.Preferences.EmailNegligeables.HasValue) user.Preferences.EmailNegligeables = dto.Preferences.EmailNegligeables.Value;
            if (dto.Preferences.PushPrimordiales.HasValue) user.Preferences.PushPrimordiales = dto.Preferences.PushPrimordiales.Value;
            if (dto.Preferences.PushSecondaires.HasValue) user.Preferences.PushSecondaires = dto.Preferences.PushSecondaires.Value;
            if (dto.Preferences.PushNegligeables.HasValue) user.Preferences.PushNegligeables = dto.Preferences.PushNegligeables.Value;
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepository.UpdateAsync(user, ct);

        return MapToResponse(user);
    }

    public async Task SoftDeleteAsync(Guid userId, CancellationToken ct = default)
    {
        await _userRepository.SoftDeleteAsync(userId, ct);
        _logger.LogInformation("Utilisateur soft-deleted: {UserId}", userId);
    }

    public async Task<PaginatedResult<UserResponseDto>> GetAllPaginatedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var users = await _userRepository.GetAllPaginatedAsync(page, pageSize, search, ct);
        var total = await _userRepository.CountAsync(search, ct);

        return new PaginatedResult<UserResponseDto>
        {
            Items = users.Select(MapToResponse),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    // ── Notifications de bienvenue ───────────────────────────────────────────

    private async Task SendWelcomeNotificationsAsync(Domain.Entities.User user, CancellationToken ct)
    {
        try
        {
            // 1. Bienvenue festive — GoScore de départ annoncé
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = user.Id,
                Type = NotificationType.Welcome,
                Title = $"Bienvenue {user.FirstName} ! Vous avez {InitialGoScore} GoPoints !",
                Body = $"Super, vous faites maintenant partie de la communauté Covoiturage La Cité ! " +
                       $"On vous offre {InitialGoScore} GoPoints pour bien démarrer. " +
                       "Plus vous covoiturez, plus vous gagnez — et la planète vous dit merci !",
                IsImportant = true,
                DeepLink = "/goboard"
            }, ct);

            // 2. Guide pas à pas — comment ça marche
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = user.Id,
                Type = NotificationType.HowItWorks,
                Title = "Comment ça marche ? Voici vos 4 étapes",
                Body = "1. Complétez votre profil pour gagner 50 GoPoints. " +
                       "2. Cherchez un trajet ou publiez le vôtre. " +
                       "3. Confirmez votre réservation et covoiturez ! " +
                       "4. Laissez un avis pour renforcer la confiance dans la communauté. " +
                       "Consultez le guide complet dans l'application.",
                IsImportant = false,
                DeepLink = "/onboarding/how-it-works"
            }, ct);

            _logger.LogInformation("Notifications de bienvenue envoyées à {UserId}", user.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur envoi notifications bienvenue pour {UserId}", user.Id);
        }
    }

    // ── Mapping privé ────────────────────────────────────────────────────────

    private static UserResponseDto MapToResponse(Domain.Entities.User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            SchoolRole = user.SchoolRole,
            Status = user.Status,
            IsProfileVerified = user.IsProfileVerified,
            CanBeDriver = user.CanBeDriver,
            GoScore = user.GoScore,
            ReputationPoints = user.ReputationPoints,
            Language = user.Language,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            DriverProfile = user.DriverProfile == null ? null : new DriverProfileDto
            {
                Id = user.DriverProfile.Id,
                ValidationStatus = user.DriverProfile.ValidationStatus.ToString().ToLower(),
                AverageRating = user.DriverProfile.AverageRating,
                TotalTripsAsDriver = user.DriverProfile.TotalTripsAsDriver,
                CancellationRate = user.DriverProfile.CancellationRate,
                PunctualityScore = user.DriverProfile.PunctualityScore,
                NoShowCount = user.DriverProfile.NoShowCount,
                Co2SavedKg = user.DriverProfile.Co2SavedKg,
                BalanceAvailable = user.DriverProfile.BalanceAvailable
            },
            Preferences = user.Preferences == null ? null : new UserPreferencesDto
            {
                MusicAccepted = user.Preferences.MusicAccepted,
                PetsAccepted = user.Preferences.HasPets,
                SmokingAccepted = user.Preferences.SmokesRegularly,
                ConversationLevel = user.Preferences.ConversationLevel.ToString().ToLower()
            }
        };
    }
}
