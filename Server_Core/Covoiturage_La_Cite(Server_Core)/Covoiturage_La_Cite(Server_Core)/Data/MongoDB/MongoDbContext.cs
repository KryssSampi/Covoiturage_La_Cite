using MongoDB.Driver;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration config)
    {
        var client = new MongoClient(
            config["MongoDb:ConnectionString"]
        );

        _database = client.GetDatabase(
            config["MongoDb:Database"]
        );
    }

    public IMongoCollection<T> Collection<T>(string name)
        => _database.GetCollection<T>(name);
}
