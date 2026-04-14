using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using System.Text.Json;

namespace Covoiturage_La_Cite_Server_Core_.Api.Middlewares;

/// <summary>
/// Middleware de sécurité — Requêtes Web (Next.js BFF).
///
/// Vérifie que chaque requête provenant du web dispose d'un header X-Web-Session-Key
/// valide (clé temporaire liée au JWT, stockée dans WebSessionKeys).
///
/// Skip complet si IsTestMode = true (développement local sans PostgreSQL).
///
/// Placement : après UseAuthentication() / UseAuthorization().
/// </summary>
public class WebSessionKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<WebSessionKeyMiddleware> _logger;

    // Routes exclues (auth initiale, swagger, hangfire)
    private static readonly HashSet<string> _excludedPrefixes = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/auth/",
        "/swagger",
        "/openapi",
        "/hangfire",
        "/hubs/",
    };

    public WebSessionKeyMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<WebSessionKeyMiddleware> logger)
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

        // ── Routes exclues ──────────────────────────────────────────────────
        var path = context.Request.Path.Value ?? string.Empty;
        if (_excludedPrefixes.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        // ── Requêtes non-web (mobile ou interne) ────────────────────────────
        // Si le header X-Web-Session-Key n'est pas présent, ce n'est pas une requête web → on passe
        if (!context.Request.Headers.ContainsKey("X-Web-Session-Key"))
        {
            await _next(context);
            return;
        }

        // ── Validation de la clé ────────────────────────────────────────────
        var sessionKey = context.Request.Headers["X-Web-Session-Key"].ToString();
        if (string.IsNullOrWhiteSpace(sessionKey))
        {
            _logger.LogWarning("X-Web-Session-Key vide depuis {IP}", context.Connection.RemoteIpAddress);
            await RejectAsync(context, "Clé de session web invalide");
            return;
        }

        // TODO (post-dev): appeler ISecurityService.ValidateWebSessionKeyAsync(sessionKey, userId)
        // Pour l'instant on vérifie juste la présence (la DB n'est pas encore ouverte).
        // Activer la validation complète après `dotnet ef database update`.

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
