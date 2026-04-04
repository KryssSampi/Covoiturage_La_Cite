using System.Security.Cryptography;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
            var result = await _authSession.VerifyCodeAsync(idKeyHash, request.Code, GetClientIp(), GetUserAgent(), ct);

            if (result.Success)
            {
                // Si l'utilisateur existait, finaliser le login
                var loginResult = await TryFinalizeLogin(idKeyHash, ct);
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
            var result = await _authSession.PasswordLoginAsync(idKeyHash, request.Password, GetClientIp(), GetUserAgent(), ct);
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
            var result = await _authSession.RegisterAsync(
                idKeyHash, request.FirstName, request.LastName, request.Password,
                GetClientIp(), GetUserAgent(), ct);
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

            return StatusCode(429, ApiResponse<BlockedResponse>.Fail("Session bloquée.", new[] { $"Réessayez dans {blocked.RemainingSeconds} secondes." }));
        }

        return StatusCode(429, ApiResponse.Fail("Session bloquée."));
    }

    private async Task<LoginResultDto?> TryFinalizeLogin(string idKeyHash, CancellationToken ct)
    {
        try
        {
            return await _authSession.FinalizeLoginAsync(idKeyHash, GetClientIp(), GetUserAgent(), ct);
        }
        catch
        {
            return null; // pas un utilisateur existant, juste un code validé pour inscription
        }
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
