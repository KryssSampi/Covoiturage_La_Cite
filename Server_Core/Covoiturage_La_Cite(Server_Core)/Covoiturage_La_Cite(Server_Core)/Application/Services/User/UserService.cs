using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.User;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly MicrosoftSsoService _ssoService;
    private readonly TokenService _tokenService;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        MicrosoftSsoService ssoService,
        TokenService tokenService,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _ssoService = ssoService;
        _tokenService = tokenService;
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
                CanBeDriver = user.CanBeDriver
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
            await _userRepository.AddAsync(user, ct);
            isNew = true;
            _logger.LogInformation("[TESTMODE] Nouvel utilisateur test créé: {Email}", email);
        }

        if (user.Status == UserStatus.Suspended)
            throw new UnauthorizedAccessException("Compte suspendu");
        if (user.Status == UserStatus.Banned)
            throw new UnauthorizedAccessException("Compte banni");

        var token = _tokenService.GenerateToken(user);

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
                CanBeDriver = user.CanBeDriver
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

    public async Task<UserPublicDto?> GetPublicProfileAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _userRepository.GetPublicProfileAsync(id, ct);
        if (user == null) return null;

        return new UserPublicDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            IsProfileVerified = user.IsProfileVerified,
            CanBeDriver = user.CanBeDriver,
            SchoolRole = user.SchoolRole,
            GoScore = user.GoScore,
            Language = user.Language,
            CreatedAt = user.CreatedAt,
            DriverProfile = user.DriverProfile == null ? null : new DriverProfilePublicDto
            {
                ValidationStatus = user.DriverProfile.ValidationStatus.ToString().ToLower(),
                AverageRating = user.DriverProfile.AverageRating,
                TotalTripsAsDriver = user.DriverProfile.TotalTripsAsDriver,
                Co2SavedKg = user.DriverProfile.Co2SavedKg
            }
        };
    }

    public async Task<UserResponseDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto, CancellationToken ct = default)
    {
        var user = await _userRepository.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;
        if (dto.Language != null) user.Language = dto.Language;

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
