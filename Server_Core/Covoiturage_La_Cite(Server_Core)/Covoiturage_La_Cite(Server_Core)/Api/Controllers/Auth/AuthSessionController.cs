using System.Security.Cryptography;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthSessionController : ControllerBase
{
    private readonly IAuthSessionService _authSession;
    private const string IdKeyCookie = "auth_session_key";

    public AuthSessionController(IAuthSessionService authSession)
    {
        _authSession = authSession;
    }

    // ── POST /api/auth/logout ──────────────────────────────────────────────
    /// <summary>Déconnexion explicite : invalide le refresh token côté serveur. Le cookie sc_refresh est lu automatiquement.</summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth.RefreshRequest? request, CancellationToken ct)
    {
        var refreshToken = Request.Cookies["sc_refresh"] ?? request?.RefreshToken;
        if (!string.IsNullOrWhiteSpace(refreshToken))
            await _authSession.LogoutAsync(refreshToken, ct);

        // Supprimer le cookie refresh côté serveur
        Response.Cookies.Delete("sc_refresh");
        return Ok(ApiResponse.Ok("Déconnexion réussie."));
    }

    // ── POST /api/auth/refresh ─────────────────────────────────────────────
    /// <summary>Refresh access token en échange d'un refresh token. Le refresh token peut être fourni dans le body ou dans le cookie httpOnly `sc_refresh`.</summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth.RefreshRequest? request, CancellationToken ct)
    {
        // Prefer cookie if present
        var refreshToken = Request.Cookies["sc_refresh"] ?? request?.RefreshToken;
        if (string.IsNullOrWhiteSpace(refreshToken))
            return BadRequest(ApiResponse.Fail("Refresh token manquant."));

        try
        {
            var clientType = ResolveClientType(request?.ClientType);
            var result = await _authSession.RefreshAsync(refreshToken, GetClientIp(), GetUserAgent(), clientType, ct);
            return Ok(ApiResponse<Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth.RefreshResultDto>.Ok(result));
        }
        catch (KeyNotFoundException)
        {
            return Unauthorized(ApiResponse.Fail("Refresh token invalide."));
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(ApiResponse.Fail(ex.Message));
        }
        catch (Exception ex)
        {
            // fallback
            return StatusCode(500, ApiResponse.Fail("Erreur serveur lors du refresh."));
        }
    }

    // ── POST /api/auth/init-session ─────────────────────────────────────────
    /// <summary>Crée une AuthSession. Retourne publicId dans le body et idKey dans un cookie httpOnly.</summary>
    [HttpPost("init-session")]
    public async Task<IActionResult> InitSession(CancellationToken ct)
    {
        var ip = GetClientIp();
        var ua = GetUserAgent();

        var result = await _authSession.InitSessionAsync(ip, ua, ct);

        // Stocker l'idKey dans un cookie httpOnly sécurisé
        SetIdKeyCookie(result.IdKey, result.ExpiresAt);

        return Ok(ApiResponse<InitSessionResponse>.Ok(result));
    }

    // ── POST /api/auth/verify-email ─────────────────────────────────────────
    /// <summary>Vérifie si l'email existe. Envoie un OTP si nouvel utilisateur.</summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request, CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        // Validation domaine
        var email = request.Email?.Trim().ToLowerInvariant() ?? "";
        if (!IsAllowedDomain(email))
            return BadRequest(ApiResponse.Fail("Seuls les emails @collegelacite.ca et @lacitec.on.ca sont acceptés."));

        try
        {
            var result = await _authSession.VerifyEmailAsync(idKeyHash, email, GetClientIp(), GetUserAgent(), ct);
            return Ok(ApiResponse<VerifyEmailResponse>.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "BLOCKED")
        {
            return await ReturnBlocked(idKeyHash, ct);
        }
        catch (KeyNotFoundException)
        {
            return Unauthorized(ApiResponse.Fail("Session d'authentification introuvable."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/auth/verify-code ──────────────────────────────────────────
    /// <summary>Vérifie le code OTP saisi par l'utilisateur.</summary>
    [HttpPost("verify-code")]
    public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeRequest request, CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        try
        {
            var result = await _authSession.VerifyCodeAsync(idKeyHash, request.Code, GetClientIp(), GetUserAgent(), ct, request.RememberOtp);

            if (result.Success)
            {
                // Si l'utilisateur existait, finaliser le login
                var clientType = ResolveClientType(request.ClientType);
                var loginResult = await TryFinalizeLogin(idKeyHash, clientType, ct);
                if (loginResult != null)
                    return Ok(ApiResponse<LoginResultDto>.Ok(loginResult));
            }

            return Ok(ApiResponse<VerifyCodeResponse>.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "BLOCKED")
        {
            return await ReturnBlocked(idKeyHash, ct);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ── POST /api/auth/renew-code ───────────────────────────────────────────
    /// <summary>Renouvelle le code OTP (max 3 fois).</summary>
    [HttpPost("renew-code")]
    public async Task<IActionResult> RenewCode(CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        try
        {
            var result = await _authSession.RenewCodeAsync(idKeyHash, GetClientIp(), GetUserAgent(), ct);
            return Ok(ApiResponse<RenewCodeResponse>.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "BLOCKED")
        {
            return await ReturnBlocked(idKeyHash, ct);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ── GET /api/auth/otp-status ───────────────────────────────────────────
    /// <summary>Retourne le statut OTP (expiration, dernier envoi, resends restants)</summary>
    [HttpGet("otp-status")]
    public async Task<IActionResult> OtpStatus(CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        try
        {
            var status = await _authSession.GetOtpStatusAsync(idKeyHash, ct);
            return Ok(ApiResponse<OtpStatusResponse>.Ok(status));
        }
        catch (KeyNotFoundException)
        {
            return Unauthorized(ApiResponse.Fail("Session d'authentification introuvable."));
        }
    }

    // ── POST /api/auth/password-login ───────────────────────────────────────
    /// <summary>Login par mot de passe pour utilisateurs existants. Déclenche un OTP 2FA.</summary>
    [HttpPost("password-login")]
    public async Task<IActionResult> PasswordLogin([FromBody] PasswordLoginRequest request, CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        try
        {
            var clientType = ResolveClientType(request.ClientType);
            var result = await _authSession.PasswordLoginAsync(idKeyHash, request.Password, GetClientIp(), GetUserAgent(), clientType, ct);
            return Ok(ApiResponse<LoginResultDto>.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "OTP_SENT")
        {
            return Ok(ApiResponse.Ok("Code de vérification envoyé par email."));
        }
        catch (InvalidOperationException ex) when (ex.Message == "BLOCKED")
        {
            return await ReturnBlocked(idKeyHash, ct);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ── GET /api/auth/blocked-status ────────────────────────────────────────
    /// <summary>Retourne le statut de blocage de la session.</summary>
    [HttpGet("blocked-status")]
    public async Task<IActionResult> BlockedStatus(CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        var blocked = await _authSession.GetBlockedStatusAsync(idKeyHash, ct);
        if (blocked == null)
            return Ok(ApiResponse.Ok("Session non bloquée."));

        return Ok(ApiResponse<BlockedResponse>.Ok(blocked));
    }

    // ── POST /api/auth/register ─────────────────────────────────────────────
    /// <summary>Crée un compte utilisateur après validation OTP (nouvel utilisateur).</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var idKeyHash = GetIdKeyHash();
        if (idKeyHash == null)
            return Unauthorized(ApiResponse.Fail("Session d'authentification manquante."));

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            return BadRequest(ApiResponse.Fail("Le prénom et le nom sont requis."));

        if (request.Password.Length < 8)
            return BadRequest(ApiResponse.Fail("Le mot de passe doit contenir au moins 8 caractères."));

        try
        {
            var clientType = ResolveClientType(request.ClientType);
            var result = await _authSession.RegisterAsync(
                idKeyHash, request.FirstName, request.LastName, request.Password,
                GetClientIp(), GetUserAgent(), clientType, ct);
            return Ok(ApiResponse<LoginResultDto>.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "BLOCKED")
        {
            return await ReturnBlocked(idKeyHash, ct);
        }
        catch (KeyNotFoundException)
        {
            return Unauthorized(ApiResponse.Fail("Session d'authentification introuvable."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════════════


    [AllowAnonymous]
    [HttpGet("public-key")]
    public IActionResult GetPublicKey()
    {
        return Ok(new { publicKey = JwtRsaKeyStore.GetPublicKeyPem() });
    }
    private string? GetIdKeyHash()
    {
        var idKey = Request.Cookies[IdKeyCookie];
        if (string.IsNullOrWhiteSpace(idKey)) return null;

        var bytes = System.Text.Encoding.UTF8.GetBytes(idKey);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }

    private void SetIdKeyCookie(string idKey, DateTimeOffset expiresAt)
    {
        Response.Cookies.Append(IdKeyCookie, idKey, new CookieOptions
        {
            HttpOnly = true,
            Secure = !Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.Equals("Development", StringComparison.OrdinalIgnoreCase) ?? true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth",
            Expires = expiresAt,
        });
    }

    private async Task<IActionResult> ReturnBlocked(string idKeyHash, CancellationToken ct)
    {
        var blocked = await _authSession.GetBlockedStatusAsync(idKeyHash, ct);
        if (blocked != null)
        {
            // Stocker cookie de blocage côté client pour le compteur
            Response.Cookies.Append("auth_blocked_until", blocked.BlockedUntil.ToUnixTimeSeconds().ToString(), new CookieOptions
            {
                HttpOnly = false, // lisible par JS pour le compteur
                Secure = !Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.Equals("Development", StringComparison.OrdinalIgnoreCase) ?? true,
                SameSite = SameSiteMode.Strict,
                Path = "/",
                Expires = blocked.BlockedUntil,
            });

            return StatusCode(429, ApiResponse.Fail("Session bloquée.", new[] { $"Réessayez dans {blocked.RemainingSeconds} secondes." }));
        }

        return StatusCode(429, ApiResponse.Fail("Session bloquée."));
    }

    private async Task<LoginResultDto?> TryFinalizeLogin(string idKeyHash, string clientType, CancellationToken ct)
    {
        try
        {
            return await _authSession.FinalizeLoginAsync(idKeyHash, GetClientIp(), GetUserAgent(), clientType, ct);
        }
        catch
        {
            return null; // pas un utilisateur existant, juste un code validé pour inscription
        }
    }


    private string ResolveClientType(string? bodyClientType)
    {
        var headerClientType = Request.Headers["X-Client-Type"].ToString();
        if (string.Equals(headerClientType, "mobile", StringComparison.OrdinalIgnoreCase))
            return "mobile";
        if (string.Equals(headerClientType, "web", StringComparison.OrdinalIgnoreCase))
            return "web";

        if (string.Equals(bodyClientType, "mobile", StringComparison.OrdinalIgnoreCase))
            return "mobile";
        if (string.Equals(bodyClientType, "web", StringComparison.OrdinalIgnoreCase))
            return "web";

        var ua = GetUserAgent();
        if (ua.Contains("Dart", StringComparison.OrdinalIgnoreCase) ||
            ua.Contains("Flutter", StringComparison.OrdinalIgnoreCase))
            return "mobile";

        return "web";
    }
    private string GetClientIp()
        => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    private string GetUserAgent()
        => Request.Headers.UserAgent.ToString();

    private static bool IsAllowedDomain(string email)
    {
        return email.EndsWith("@collegelacite.ca", StringComparison.OrdinalIgnoreCase)
            || email.EndsWith("@lacitec.on.ca", StringComparison.OrdinalIgnoreCase);
    }
}



