using Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB;

public class MongoDbContext
{
    private static bool _serializersRegistered;
    private static readonly object _lock = new();

    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration config)
    {
        // Enregistrement unique au niveau processus — DateTimeOffset stocké en string ISO 8601
        if (!_serializersRegistered)
        {
            lock (_lock)
            {
                if (!_serializersRegistered)
                {
                    // DateTimeOffset -> ISO string for readability/interoperability.
                    BsonSerializer.TryRegisterSerializer(
                        new DateTimeOffsetSerializer(BsonType.String));
                    // Ensure every Guid in Mongo models is encoded with Standard representation.
                    BsonSerializer.TryRegisterSerializer(typeof(Guid), new GuidSerializer(GuidRepresentation.Standard));
                    _serializersRegistered = true;
                }
            }
        }

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

    /// <summary>Sections FAQ (Foire Aux Questions) pour le site web.</summary>
    public IMongoCollection<FaqItem> Faqs
        => _database.GetCollection<FaqItem>("faqs");

    // ── Accès générique (pour les cas non typés) ──────────────────────────────

    public IMongoCollection<T> Collection<T>(string name)
        => _database.GetCollection<T>(name);
}
