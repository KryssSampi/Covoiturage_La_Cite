using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

/// <summary>
/// Service OTP en mémoire côté serveur.
///
/// Flux :
///   1. L'utilisateur soumet son email → le serveur génère un code et retourne un sessionId.
///   2. Le client conserve seulement le sessionId (Guid opaque).
///   3. L'utilisateur entre le code reçu par mail → ValidateCode(sessionId, code).
///   4. Le code est consommé/purgé.
///
/// Sécurité :
///   - Le code dure 5 minutes maximum.
///   - Un autre navigateur ne peut pas valider (il n'a pas le sessionId).
///   - PurgeExpired() est appelé tous les 30 s par SessionCodeCleanupService.
/// </summary>
public class SessionCodeService
{
    private record SessionEntry(Guid UserId, string Code, DateTime ExpiresAt);

    private readonly ConcurrentDictionary<Guid, SessionEntry> _store = new();
    private readonly ILogger<SessionCodeService> _logger;

    public SessionCodeService(ILogger<SessionCodeService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Crée un code OTP à 6 chiffres et retourne le sessionId associé.
    /// </summary>
    public (Guid SessionId, string Code) GenerateCode(Guid userId)
    {
        var sessionId = Guid.NewGuid();
        var code = RandomNumberGenerator.GetInt32(100_000, 999_999).ToString();
        var entry = new SessionEntry(userId, code, DateTime.UtcNow.AddMinutes(5));

        _store[sessionId] = entry;

        _logger.LogDebug("SessionCode généré pour user {UserId}, session {SessionId}", userId, sessionId);
        return (sessionId, code);
    }

    /// <summary>
    /// Valide le code et retourne le userId si correct + non expiré.
    /// Le code est immédiatement invalidé après validation.
    /// </summary>
    public Guid? ValidateCode(Guid sessionId, string code)
    {
        if (!_store.TryRemove(sessionId, out var entry))
            return null;

        if (entry.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("SessionCode expiré pour session {SessionId}", sessionId);
            return null;
        }

        if (!string.Equals(entry.Code, code, StringComparison.Ordinal))
        {
            // Remettre l'entrée (pour permettre retry si la logique l'exige)
            // On ne remet pas pour éviter le brute-force — code à usage unique.
            _logger.LogWarning("Code invalide pour session {SessionId}", sessionId);
            return null;
        }

        return entry.UserId;
    }

    /// <summary>
    /// Supprime toutes les entrées expirées. Appelé toutes les 30 s.
    /// </summary>
    public void PurgeExpired()
    {
        var now = DateTime.UtcNow;
        var expired = _store
            .Where(kvp => kvp.Value.ExpiresAt < now)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expired)
            _store.TryRemove(key, out _);

        if (expired.Count > 0)
            _logger.LogDebug("SessionCode: {Count} codes expirés supprimés", expired.Count);
    }

    /// <summary>Nombre de sessions actives (pour monitoring).</summary>
    public int ActiveCount => _store.Count;
}
