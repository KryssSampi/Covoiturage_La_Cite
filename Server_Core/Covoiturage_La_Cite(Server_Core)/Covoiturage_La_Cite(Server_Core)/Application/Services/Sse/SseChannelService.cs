using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Sse;

/// <summary>
/// Service singleton qui maintient un Channel&lt;string&gt; par utilisateur.
/// NotificationService publie ici après chaque CreateAsync.
/// Le contrôleur SSE s'abonne et streame au client web (text/event-stream).
/// </summary>
public class SseChannelService
{
    // Un channel non-borné par userId — le reader est le contrôleur SSE
    private readonly ConcurrentDictionary<Guid, Channel<string>> _channels = new();

    /// <summary>
    /// Crée ou renvoie le channel SSE de l'utilisateur.
    /// Appelé par le contrôleur SSE au moment de la connexion.
    /// </summary>
    public ChannelReader<string> Subscribe(Guid userId)
    {
        var channel = _channels.GetOrAdd(userId, _ => Channel.CreateUnbounded<string>(
            new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }));
        return channel.Reader;
    }

    /// <summary>
    /// Libère le channel d'un utilisateur (à appeler quand la connexion SSE ferme).
    /// </summary>
    public void Unsubscribe(Guid userId)
        => _channels.TryRemove(userId, out _);

    /// <summary>
    /// Publie un événement SSE sérialisé JSON vers le channel de l'utilisateur.
    /// Fire-and-forget : si l'utilisateur n'est pas connecté en SSE, l'event est perdu.
    /// </summary>
    public void Publish(Guid userId, string eventName, object payload)
    {
        if (!_channels.TryGetValue(userId, out var channel)) return;

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        // Format SSE : "event: <name>\ndata: <json>\n\n"
        var message = $"event: {eventName}\ndata: {json}\n\n";
        channel.Writer.TryWrite(message);
    }
}
