using SQLite;

namespace Covoiturage_la_cite__App_Mobile_.Services.Cache
{
    /// <summary>
    /// Wrapper SQLite-net-pcl — base de données locale persistante.
    /// Utilisé pour : user, trips, réservations, conversations (accès offline).
    /// </summary>
    public interface ISQLiteService
    {
        Task InitAsync();
        Task<List<T>> GetAllAsync<T>() where T : new();
        Task<T?> GetByIdAsync<T>(int id) where T : new();
        Task<int> InsertOrReplaceAsync<T>(T item) where T : new();
        Task<int> InsertOrReplaceAllAsync<T>(IEnumerable<T> items) where T : new();
        Task<int> DeleteAsync<T>(T item) where T : new();
        Task<int> DeleteByIdAsync<T>(int id) where T : new();
        Task<List<T>> QueryAsync<T>(string query, params object[] args) where T : new();
    }

    public class SQLiteService : ISQLiteService
    {
        private SQLiteAsyncConnection? _db;
        private static readonly SemaphoreSlim _initLock = new(1, 1);
        private bool _initialized = false;

        private static string DbPath =>
            Path.Combine(FileSystem.AppDataDirectory, "covoiturage_cache.db3");

        public async Task InitAsync()
        {
            if (_initialized) return;
            await _initLock.WaitAsync();
            try
            {
                if (_initialized) return;
                _db = new SQLiteAsyncConnection(DbPath,
                    SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);

                // Register all entity tables
                await _db.CreateTablesAsync(CreateFlags.None,
                    typeof(Core.Database.UserEntity),
                    typeof(Core.Database.TripEntity),
                    typeof(Core.Database.ReservationEntity),
                    typeof(Core.Database.ConversationEntity),
                    typeof(Core.Database.MessageEntity));

                _initialized = true;
            }
            finally { _initLock.Release(); }
        }

        private async Task<SQLiteAsyncConnection> GetDb()
        {
            if (!_initialized) await InitAsync();
            return _db!;
        }

        public async Task<List<T>> GetAllAsync<T>() where T : new()
        {
            var db = await GetDb();
            return await db.Table<T>().ToListAsync();
        }

        public async Task<T?> GetByIdAsync<T>(int id) where T : new()
        {
            var db = await GetDb();
            return await db.FindAsync<T>(id);
        }

        public async Task<int> InsertOrReplaceAsync<T>(T item) where T : new()
        {
            var db = await GetDb();
            return await db.InsertOrReplaceAsync(item);
        }

        public async Task<int> InsertOrReplaceAllAsync<T>(IEnumerable<T> items) where T : new()
        {
            var db = await GetDb();
            // SQLiteAsyncConnection n'a pas InsertOrReplaceAllAsync, donc on doit faire InsertOrReplaceAsync pour chaque item
            int count = 0;
            foreach (var item in items)
            {
                count += await db.InsertOrReplaceAsync(item);
            }
            return count;
        }

        public async Task<int> DeleteAsync<T>(T item) where T : new()
        {
            var db = await GetDb();
            return await db.DeleteAsync(item);
        }

        public async Task<int> DeleteByIdAsync<T>(int id) where T : new()
        {
            var db = await GetDb();
            return await db.DeleteAsync<T>(id);
        }

        public async Task<List<T>> QueryAsync<T>(string query, params object[] args) where T : new()
        {
            var db = await GetDb();
            return await db.QueryAsync<T>(query, args);
        }
    }
}
