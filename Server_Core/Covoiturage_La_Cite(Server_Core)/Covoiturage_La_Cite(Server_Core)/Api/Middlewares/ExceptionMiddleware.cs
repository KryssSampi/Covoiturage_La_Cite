using System.Net;
using System.Text.Json;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;

namespace Covoiturage_La_Cite_Server_Core_.Api.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception non gérée: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Ne pas écrire si la réponse a déjà commencé
        if (context.Response.HasStarted) return;

        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            OperationCanceledException    => (HttpStatusCode.BadRequest,           "Requête annulée"),
            UnauthorizedAccessException e => (HttpStatusCode.Unauthorized,         string.IsNullOrWhiteSpace(e.Message) ? "Non autorisé" : e.Message),
            KeyNotFoundException          => (HttpStatusCode.NotFound,             "Ressource introuvable"),
            ArgumentNullException e       => (HttpStatusCode.BadRequest,           e.Message),
            ArgumentException e           => (HttpStatusCode.BadRequest,           e.Message),
            FormatException               => (HttpStatusCode.BadRequest,           "Format de données invalide"),
            NotSupportedException e       => (HttpStatusCode.BadRequest,           e.Message),
            InvalidOperationException e   => (HttpStatusCode.Conflict,             e.Message),
            _                             => (HttpStatusCode.InternalServerError,  "Une erreur interne est survenue")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse.Fail(message);
        await context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
