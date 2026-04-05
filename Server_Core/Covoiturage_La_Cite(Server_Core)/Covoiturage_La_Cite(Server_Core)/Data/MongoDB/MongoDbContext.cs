using Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;
using MongoDB.Driver;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration config)
    {
        var connectionString = config["MongoDB:ConnectionString"];
        var databaseName = config["MongoDB:DatabaseName"];

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    // ── Collections ───────────────────────────────────────────────────────────

    /// <summary>Logs applicatifs : erreurs, activité, auth events.</summary>
    public IMongoCollection<AppLog> AppLogs
        => _database.GetCollection<AppLog>("app_logs");

    /// <summary>Messages de chat instantané liés aux trajets.</summary>
    public IMongoCollection<ChatMessage> ChatMessages
        => _database.GetCollection<ChatMessage>("chat_messages");

    /// <summary>Astuces/conseils éditoriaux affichés sur le dashboard.</summary>
    public IMongoCollection<Astuce> Astuces
        => _database.GetCollection<Astuce>("astuces");

    /// <summary>Vidéos de nouveautés publiées par l'administration.</summary>
    public IMongoCollection<Nouveaute> Nouveautes
        => _database.GetCollection<Nouveaute>("nouveautes");

    /// <summary>Historique de connexions par utilisateur (time-series).</summary>
    public IMongoCollection<UserActivity> UserActivities
        => _database.GetCollection<UserActivity>("user_activities");

    // ── Accès générique (pour les cas non typés) ──────────────────────────────

    public IMongoCollection<T> Collection<T>(string name)
        => _database.GetCollection<T>(name);
}
