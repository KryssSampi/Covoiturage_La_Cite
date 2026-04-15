using System.Text.Json;

namespace Covoiturage_la_cite__App_Mobile_.Services.Cache
{
    /// <summary>
    /// Cache léger en mémoire + fichier JSON avec TTL.
    /// Stratégie : lecture immédiate depuis cache, rafraîchissement en arrière-plan.
    /// </summary>
    public interface IJsonCacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? ttl = null);
        Task InvalidateAsync(string key);
        Task ClearAllAsync();
    }

    public class JsonCacheService : IJsonCacheService
    {
        private static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(5);
        private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

        private readonly Dictionary<string, (object Value, DateTime ExpiresAt)> _memory = new();
        private readonly SemaphoreSlim _lock = new(1, 1);

        private static string CacheDir => Path.Combine(FileSystem.CacheDirectory, "json_cache");

        public async Task<T?> GetAsync<T>(string key)
        {
            await _lock.WaitAsync();
            try
            {
                // 1. Try memory cache first
                if (_memory.TryGetValue(key, out var entry) && DateTime.UtcNow < entry.ExpiresAt)
                    return (T)entry.Value;

                // 2. Try file cache
                var filePath = GetFilePath(key);
                if (!File.Exists(filePath)) return default;

                var wrapper = JsonSerializer.Deserialize<CacheWrapper<T>>(
                    await File.ReadAllTextAsync(filePath), _json);

                if (wrapper == null || DateTime.UtcNow >= wrapper.ExpiresAt)
                {
                    File.Delete(filePath);
                    return default;
                }

                // Restore to memory
                if (wrapper.Value != null)
                    _memory[key] = (wrapper.Value, wrapper.ExpiresAt);

                return wrapper.Value;
            }
            finally { _lock.Release(); }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null)
        {
            var expiresAt = DateTime.UtcNow + (ttl ?? DefaultTtl);

            await _lock.WaitAsync();
            try
            {
                if (value != null)
                    _memory[key] = (value, expiresAt);

                Directory.CreateDirectory(CacheDir);
                var wrapper = new CacheWrapper<T> { Value = value, ExpiresAt = expiresAt };
                await File.WriteAllTextAsync(GetFilePath(key), JsonSerializer.Serialize(wrapper, _json));
            }
            finally { _lock.Release(); }
        }

        public async Task InvalidateAsync(string key)
        {
            await _lock.WaitAsync();
            try
            {
                _memory.Remove(key);
                var filePath = GetFilePath(key);
                if (File.Exists(filePath)) File.Delete(filePath);
            }
            finally { _lock.Release(); }
        }

        public async Task ClearAllAsync()
        {
            await _lock.WaitAsync();
            try
            {
                _memory.Clear();
                if (Directory.Exists(CacheDir))
                    Directory.Delete(CacheDir, recursive: true);
            }
            finally { _lock.Release(); }
        }

        private static string GetFilePath(string key)
        {
            var safe = string.Concat(key.Select(c => char.IsLetterOrDigit(c) ? c : '_'));
            return Path.Combine(CacheDir, $"{safe}.json");
        }

        private class CacheWrapper<T>
        {
            public T? Value { get; set; }
            public DateTime ExpiresAt { get; set; }
        }
    }
}
