using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using System.Text.Json;

namespace Covoiturage_La_Cite_Server_Core_.Api.Middlewares;

/// <summary>
/// Middleware de sécurité — Requêtes Mobile (React Native).
///
/// Vérifie la signature ECC-P256 du fingerprint appareil via X-Device-Fingerprint.
/// Appelle ISecurityService.ValidateSignatureAsync() pour valider le certificat client.
///
/// Skip complet si IsTestMode = true.
/// Commenté dans Program.cs jusqu'à l'activation mobile (activer via UseMiddleware).
///
/// Placement : après UseAuthentication().
/// </summary>
public class CertificateValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CertificateValidationMiddleware> _logger;

    public CertificateValidationMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<CertificateValidationMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // ── Guard ISTESTMODE ────────────────────────────────────────────────
        if (_configuration.GetValue<bool>("IsTestMode"))
        {
            await _next(context);
            return;
        }

        // ── Requêtes non-mobiles (pas de fingerprint) → passer ──────────────
        if (!context.Request.Headers.ContainsKey("X-Device-Fingerprint"))
        {
            await _next(context);
            return;
        }

        var fingerprint = context.Request.Headers["X-Device-Fingerprint"].ToString();
        if (string.IsNullOrWhiteSpace(fingerprint))
        {
            _logger.LogWarning("X-Device-Fingerprint vide depuis {IP}", context.Connection.RemoteIpAddress);
            await RejectAsync(context, "Fingerprint appareil invalide");
            return;
        }

        // TODO (mobile sprint): appeler ISecurityService.ValidateSignatureAsync(fingerprint, context.User)
        // pour valider le certificat ECC-P256 enrôlé.

        await _next(context);
    }

    private static async Task RejectAsync(HttpContext context, string message)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        var body = ApiResponse.Fail(message);
        await context.Response.WriteAsync(JsonSerializer.Serialize(body,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
