using System.Security.Cryptography;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

public class AuthSessionService : IAuthSessionService
{
    private readonly IAuthSessionRepository _repo;
    private readonly IUserRepository _userRepo;
    private readonly IEmailService _emailService;
    private readonly TokenService _tokenService;
    private readonly IUserProvisioningService _provisioning;
    private readonly AppDbContext _db;
    private readonly ILogger<AuthSessionService> _logger;

    private const int SessionLifetimeMinutes = 60;
    private const int OtpLifetimeMinutes = 5;
    private const int MaxOtpCurrentAttempts = 5;
    private const int MaxOtpTotalAttempts = 10;
    private const int MaxOtpResends = 3;
    private const int BlockDurationMinutes = 120; // 2h

    public AuthSessionService(
        IAuthSessionRepository repo,
        IUserRepository userRepo,
        IEmailService emailService,
        TokenService tokenService,
        IUserProvisioningService provisioning,
        AppDbContext db,
        ILogger<AuthSessionService> logger)
    {
        _repo = repo;
        _userRepo = userRepo;
        _emailService = emailService;
        _tokenService = tokenService;
        _provisioning = provisioning;
        _db = db;
        _logger = logger;
    }

    // ── Étape 0 : Créer la session ──────────────────────────────────────────
    public async Task<InitSessionResponse> InitSessionAsync(string ipAddress, string userAgent, CancellationToken ct)
    {
        var idKey = GenerateRandomToken();
        var publicId = GeneratePublicId();
        var now = DateTimeOffset.UtcNow;

        var session = new AuthSession
        {
            Id = Guid.NewGuid(),
            IdKeyHash = HashToken(idKey),
            PublicId = publicId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(SessionLifetimeMinutes),
        };

        await _repo.AddAsync(session, ct);

        _logger.LogInformation("AuthSession créée: PublicId={PublicId}, IP={IP}", publicId, ipAddress);

        return new InitSessionResponse
        {
            PublicId = publicId,
            IdKey = idKey,
            ExpiresAt = session.ExpiresAt,
        };
    }

    // ── Étape 1 : Vérifier l'email ─────────────────────────────────────────
    public async Task<VerifyEmailResponse> VerifyEmailAsync(
        string idKeyHash, string email, string ipAddress, string userAgent, CancellationToken ct)
    {
        var session = await GetValidSession(idKeyHash, ipAddress, userAgent, ct);

        session.Email = email.Trim().ToLowerInvariant();

        // Vérifier si l'utilisateur existe
        var user = await _userRepo.GetByEmailAsync(email, ct);
        if (user != null)
        {
            session.UserId = user.Id;
            await _repo.UpdateAsync(session, ct);

            return new VerifyEmailResponse { UserExists = true, OtpSent = false };
        }

        // Nouvel utilisateur → envoyer OTP directement
        await GenerateAndSendOtp(session, ct);
        await _repo.UpdateAsync(session, ct);

        return new VerifyEmailResponse { UserExists = false, OtpSent = true };
    }

    // ── Étape 2 : Vérifier le code OTP ──────────────────────────────────────
    public async Task<VerifyCodeResponse> VerifyCodeAsync(
        string idKeyHash, string code, string ipAddress, string userAgent, CancellationToken ct, bool rememberOtp = false)
    {
        var session = await GetValidSession(idKeyHash, ipAddress, userAgent, ct);

        // Vérifier que le code n'est pas expiré
        if (session.OtpCodeHash == null || session.OtpExpiresAt == null)
            throw new InvalidOperationException("Aucun code OTP actif pour cette session.");

        if (session.OtpExpiresAt < DateTimeOffset.UtcNow)
            throw new InvalidOperationException("Le code OTP a expiré. Demandez un nouveau code.");

        session.OtpCurrentAttempts++;
        session.OtpTotalAttempts++;

        // Vérifier le code
        var codeHash = HashToken(code);
        if (codeHash != session.OtpCodeHash)
        {
            // Vérifier les limites
            if (session.OtpCurrentAttempts >= MaxOtpCurrentAttempts)
            {
                BlockSession(session);
                await _repo.UpdateAsync(session, ct);
                throw new InvalidOperationException("BLOCKED");
            }

            if (session.OtpTotalAttempts >= MaxOtpTotalAttempts)
            {
                BlockSession(session);
                await _repo.UpdateAsync(session, ct);
                throw new InvalidOperationException("BLOCKED");
            }

            await _repo.UpdateAsync(session, ct);

            var remaining = Math.Min(
                MaxOtpCurrentAttempts - session.OtpCurrentAttempts,
                MaxOtpTotalAttempts - session.OtpTotalAttempts);

            return new VerifyCodeResponse { Success = false, RemainingAttempts = remaining };
        }

        // Code correct
        session.IsValidated = true;
        session.OtpCodeHash = null; // consommer le code

        // RememberOtp — désactiver le 2FA pour 30 jours (utilisateurs existants seulement)
        if (rememberOtp && session.UserId.HasValue)
        {
            var user = await _userRepo.GetByIdAsync(session.UserId.Value, ct);
            if (user != null)
            {
                user.DisabledOtp = true;
                user.DisabledOtpAt = DateTimeOffset.UtcNow;
                await _userRepo.UpdateAsync(user, ct);
            }
        }

        await _repo.UpdateAsync(session, ct);

        return new VerifyCodeResponse { Success = true, RemainingAttempts = 0 };
    }

    // ── Renouveler le code OTP ──────────────────────────────────────────────
    public async Task<RenewCodeResponse> RenewCodeAsync(
        string idKeyHash, string ipAddress, string userAgent, CancellationToken ct)
    {
        var session = await GetValidSession(idKeyHash, ipAddress, userAgent, ct);

        if (session.OtpResendCount >= MaxOtpResends)
        {
            BlockSession(session);
            await _repo.UpdateAsync(session, ct);
            throw new InvalidOperationException("BLOCKED");
        }

        if (string.IsNullOrEmpty(session.Email))
            throw new InvalidOperationException("Email non défini pour cette session.");

        session.OtpResendCount++;
        session.OtpCurrentAttempts = 0; // reset les tentatives du code courant

        await GenerateAndSendOtp(session, ct);
        await _repo.UpdateAsync(session, ct);

        return new RenewCodeResponse
        {
            Success = true,
            RemainingResends = MaxOtpResends - session.OtpResendCount,
        };
    }

    // ── Login par mot de passe (existants après OTP validé) ─────────────────
    public async Task<LoginResultDto> PasswordLoginAsync(
        string idKeyHash, string password, string ipAddress, string userAgent, CancellationToken ct)
    {
        var session = await GetValidSession(idKeyHash, ipAddress, userAgent, ct);

        if (session.UserId == null)
            throw new InvalidOperationException("Aucun utilisateur associé à cette session.");

        var user = await _userRepo.GetByIdAsync(session.UserId.Value, ct)
            ?? throw new InvalidOperationException("Utilisateur introuvable.");

        if (string.IsNullOrEmpty(user.PasswordHash))
            throw new InvalidOperationException("Aucun mot de passe défini. Veuillez d'abord vérifier votre identité par code.");

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            session.OtpTotalAttempts++; // compter aussi les tentatives de mdp

            if (session.OtpTotalAttempts >= MaxOtpTotalAttempts)
            {
                BlockSession(session);
                await _repo.UpdateAsync(session, ct);
                throw new InvalidOperationException("BLOCKED");
            }

            await _repo.UpdateAsync(session, ct);
            throw new InvalidOperationException("Mot de passe incorrect.");
        }

        // Mot de passe correct — vérifier si l'OTP est bypassé (DisabledOtp pour 30 jours)
        var otpExpiry = user.DisabledOtpAt?.AddDays(30);
        if (user.DisabledOtp && otpExpiry.HasValue && otpExpiry.Value > DateTimeOffset.UtcNow)
        {
            // Bypass OTP — finaliser le login directement
            session.IsValidated = true;
            var now = DateTimeOffset.UtcNow;
            var (accessToken, refreshToken, expiresAt) = _tokenService.GenerateTokenPair(user, session.Id.ToString(), ipAddress);
            session.RefreshTokenHash = HashToken(refreshToken);
            session.RefreshTokenExpiresAt = now.AddHours(24);
            user.LastLoginAt = now;
            await _userRepo.UpdateAsync(user, ct);
            await _repo.UpdateAsync(session, ct);
            _logger.LogInformation("Login sans OTP (DisabledOtp) pour {Email}", user.Email);
            return new LoginResultDto
            {
                AccessToken = accessToken,
                AccessTokenExpiresAt = expiresAt,
                User = new UserSummaryDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    AvatarUrl = user.AvatarUrl,
                    Role = user.Role.ToString(),
                    SchoolRole = user.SchoolRole.ToString(),
                    CanBeDriver = user.CanBeDriver,
                    AlreadySignPolitics = user.AlreadySignPolitics,
                    AlreadySubmittedAllVehiculeDocument = user.AlreadySubmittedAllVehiculeDocument,
                    AlreadySetAProfilePicture = user.AlreadySetAProfilePicture,
                    OnboardingCompleted = user.OnboardingCompleted,
                },
            };
        }

        // OTP requis → envoyer le code 2FA
        await GenerateAndSendOtp(session, ct);
        await _repo.UpdateAsync(session, ct);
        throw new InvalidOperationException("OTP_SENT");
    }

    // ── Finaliser l'auth (appelé après OTP validé pour utilisateur existant) ─
    public async Task<LoginResultDto> FinalizeLoginAsync(
        string idKeyHash, string ipAddress, string userAgent, CancellationToken ct)
    {
        var session = await GetValidSession(idKeyHash, ipAddress, userAgent, ct);

        if (!session.IsValidated)
            throw new InvalidOperationException("Session non validée.");

        if (session.UserId == null)
            throw new InvalidOperationException("Aucun utilisateur associé.");

        var user = await _userRepo.GetByIdAsync(session.UserId.Value, ct)
            ?? throw new InvalidOperationException("Utilisateur introuvable.");

        // Mettre à jour le dernier login
        user.LastLoginAt = DateTimeOffset.UtcNow;

        // Générer les tokens
        var (accessToken, refreshToken, expiresAt) = _tokenService.GenerateTokenPair(user, session.Id.ToString(), ipAddress);

        // Stocker le hash du refresh token et sa date d'expiration dans la session
        session.RefreshTokenHash = HashToken(refreshToken);
        // Par défaut, refresh token valable 24h
        session.RefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddHours(24);

        // Mettre à jour le user (last login) et la session en base
        user.LastLoginAt = DateTimeOffset.UtcNow;
        await _userRepo.UpdateAsync(user, ct);
        await _repo.UpdateAsync(session, ct);

        _logger.LogInformation("Login réussi pour {Email}, session {PublicId}", user.Email, session.PublicId);

        return new LoginResultDto
        {
            AccessToken = accessToken,
            AccessTokenExpiresAt = expiresAt,
            User = new UserSummaryDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.ToString(),
                SchoolRole = user.SchoolRole.ToString(),
                CanBeDriver = user.CanBeDriver,
                AlreadySignPolitics = user.AlreadySignPolitics,
                AlreadySubmittedAllVehiculeDocument = user.AlreadySubmittedAllVehiculeDocument,
                AlreadySetAProfilePicture = user.AlreadySetAProfilePicture,
                OnboardingCompleted = user.OnboardingCompleted,
            },
        };
    }

    // ── Refresh access token via refresh token ─────────────────────────────
    public async Task<RefreshResultDto> RefreshAsync(string refreshToken, string ipAddress, string userAgent, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new InvalidOperationException("Refresh token manquant.");

        var hash = HashToken(refreshToken);
        var session = await _repo.GetByRefreshTokenHashAsync(hash, ct)
            ?? throw new KeyNotFoundException("Refresh token invalide ou introuvable.");

        // Vérifier expiration du refresh token
        if (!session.RefreshTokenExpiresAt.HasValue || session.RefreshTokenExpiresAt.Value < DateTimeOffset.UtcNow)
            throw new InvalidOperationException("Refresh token expiré.");

        // Vérifier blocage
        if (session.IsBlocked)
            throw new InvalidOperationException("Session bloquée.");

        if (session.UserId == null)
            throw new InvalidOperationException("Session sans utilisateur associé.");

        var user = await _userRepo.GetByIdAsync(session.UserId.Value, ct)
            ?? throw new InvalidOperationException("Utilisateur introuvable pour cette session.");

        // Générer nouvelle paire (rotation du refresh token)
        var (newAccessToken, newRefreshToken, accessExpiresAt) = _tokenService.GenerateTokenPair(user, session.Id.ToString(), ipAddress);

        // Mettre à jour le hash et l'expiration du refresh token
        session.RefreshTokenHash = HashToken(newRefreshToken);
        session.RefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
        await _repo.UpdateAsync(session, ct);

        return new RefreshResultDto
        {
            AccessToken = newAccessToken,
            AccessTokenExpiresAt = accessExpiresAt,
            RefreshToken = newRefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };
    }

    // ── Inscription (nouvel utilisateur après OTP validé) ───────────────────
    public async Task<LoginResultDto> RegisterAsync(
        string idKeyHash, string firstName, string lastName, string password,
        string ipAddress, string userAgent, CancellationToken ct)
    {
        var session = await GetValidSession(idKeyHash, ipAddress, userAgent, ct);

        if (!session.IsValidated)
            throw new InvalidOperationException("Session non validée. Veuillez d'abord vérifier votre code OTP.");

        if (session.UserId != null)
            throw new InvalidOperationException("Un utilisateur est déjà associé à cette session.");

        if (string.IsNullOrEmpty(session.Email))
            throw new InvalidOperationException("Email non défini pour cette session.");

        // Vérifier que l'email n'est pas déjà pris
        var existing = await _userRepo.GetByEmailAsync(session.Email, ct);
        if (existing != null)
            throw new InvalidOperationException("Un compte existe déjà avec cet email.");

        var now = DateTimeOffset.UtcNow;
        var user = new Covoiturage_La_Cite_Server_Core_.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Email = session.Email,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = Domain.Enums.UserRole.Passenger,
            SchoolRole = Domain.Enums.SchoolRole.Etudiant,
            Status = Domain.Enums.UserStatus.Active,
            Language = "fr",
            CreatedAt = now,
            UpdatedAt = now,
            LastLoginAt = now,
        };

        await _userRepo.AddAsync(user, ct);
        await _provisioning.ProvisionAsync(user.Id, ct);

        session.UserId = user.Id;
        await _repo.UpdateAsync(session, ct);

        _logger.LogInformation("Compte créé pour {Email}, session {PublicId}", user.Email, session.PublicId);

        // Finaliser le login (générer les tokens)
        return await FinalizeLoginAsync(idKeyHash, ipAddress, userAgent, ct);
    }

    public async Task<OtpStatusResponse> GetOtpStatusAsync(string idKeyHash, CancellationToken ct = default)
    {
        var session = await _repo.GetByIdKeyHashAsync(idKeyHash, ct)
            ?? throw new KeyNotFoundException("Session d'authentification introuvable.");

        var now = DateTimeOffset.UtcNow;

        bool hasOtp = session.OtpCodeHash != null && session.OtpExpiresAt.HasValue && session.OtpExpiresAt > now;
        DateTimeOffset? expires = session.OtpExpiresAt;
        DateTimeOffset? lastSent = expires.HasValue ? expires.Value.AddMinutes(-OtpLifetimeMinutes) : null;
        int remainingResends = Math.Max(0, MaxOtpResends - session.OtpResendCount);

        return new OtpStatusResponse
        {
            HasOtp = hasOtp,
            OtpExpiresAt = expires,
            LastSentAt = lastSent,
            RemainingResends = remainingResends,
        };
    }

    // ── Statut de blocage ───────────────────────────────────────────────────
    public async Task<BlockedResponse?> GetBlockedStatusAsync(string idKeyHash, CancellationToken ct)
    {
        var session = await _repo.GetByIdKeyHashAsync(idKeyHash, ct);
        if (session == null || !session.IsBlocked || session.BlockedUntil == null)
            return null;

        if (session.BlockedUntil < DateTimeOffset.UtcNow)
        {
            // Débloquer
            session.IsBlocked = false;
            session.BlockedUntil = null;
            await _repo.UpdateAsync(session, ct);
            return null;
        }

        return new BlockedResponse
        {
            IsBlocked = true,
            BlockedUntil = session.BlockedUntil.Value,
            RemainingSeconds = (int)(session.BlockedUntil.Value - DateTimeOffset.UtcNow).TotalSeconds,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Helpers privés
    // ═══════════════════════════════════════════════════════════════════════

    private async Task<AuthSession> GetValidSession(
        string idKeyHash, string ipAddress, string userAgent, CancellationToken ct)
    {
        var session = await _repo.GetByIdKeyHashAsync(idKeyHash, ct)
            ?? throw new KeyNotFoundException("Session d'authentification introuvable.");

        // Vérifier expiration
        if (session.ExpiresAt < DateTimeOffset.UtcNow)
            throw new InvalidOperationException("Session d'authentification expirée.");

        // Vérifier blocage
        if (session.IsBlocked)
        {
            if (session.BlockedUntil.HasValue && session.BlockedUntil > DateTimeOffset.UtcNow)
                throw new InvalidOperationException("BLOCKED");

            // Débloquer si le temps est passé
            session.IsBlocked = false;
            session.BlockedUntil = null;
            await _repo.UpdateAsync(session, ct);
        }

        return session;
    }

    private async Task GenerateAndSendOtp(AuthSession session, CancellationToken ct)
    {
        var code = RandomNumberGenerator.GetInt32(100_000, 999_999).ToString();
        session.OtpCodeHash = HashToken(code);
        session.OtpExpiresAt = DateTimeOffset.UtcNow.AddMinutes(OtpLifetimeMinutes);

        try
        {
            await _emailService.SendOtpAsync(session.Email!, code, ct);
            _logger.LogDebug("OTP envoyé pour session {PublicId}", session.PublicId);
        }
        catch (Exception ex)
        {
            // L'envoi email échoue → l'OTP reste valide en session, on log le code pour déboguer
            _logger.LogError(ex, "[OTP] Échec envoi email pour session {PublicId} — code: {Code}", session.PublicId, code);
        }
    }

    private static void BlockSession(AuthSession session)
    {
        session.IsBlocked = true;
        session.BlockedUntil = DateTimeOffset.UtcNow.AddMinutes(BlockDurationMinutes);
    }

    private static string GenerateRandomToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string GeneratePublicId()
    {
        // 8 caractères alphanumériques lisibles (exclusion des caractères ambigus)
        const string alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        var sb = new System.Text.StringBuilder(8);
        for (int i = 0; i < 8; i++)
        {
            int idx = RandomNumberGenerator.GetInt32(alphabet.Length);
            sb.Append(alphabet[idx]);
        }
        return sb.ToString();
    }

    // ── Logout : invalider le refresh token ────────────────────────────────────
    public async Task LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken)) return;

        var hash = HashToken(refreshToken);
        var session = await _repo.GetByRefreshTokenHashAsync(hash, ct);
        if (session == null) return;

        session.RefreshTokenHash = null;
        session.RefreshTokenExpiresAt = null;
        await _repo.UpdateAsync(session, ct);

        _logger.LogInformation("Logout: refresh token invalidé pour session {PublicId}", session.PublicId);
    }

    private static string HashToken(string token)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
