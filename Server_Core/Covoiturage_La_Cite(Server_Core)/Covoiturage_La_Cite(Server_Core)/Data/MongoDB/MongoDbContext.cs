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

    /// <summary>
    /// Logs applicatifs : erreurs, activité, auth events.
    /// </summary>
    public IMongoCollection<AppLog> AppLogs
        => _database.GetCollection<AppLog>("app_logs");

    // ── Accès générique (pour les cas non typés) ──────────────────────────────

    public IMongoCollection<T> Collection<T>(string name)
        => _database.GetCollection<T>(name);
}
