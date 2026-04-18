using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Covoiturage_la_cite__App_Mobile_.Core.Config;

namespace Covoiturage_la_cite__App_Mobile_.Services.Api
{
    /// <summary>
    /// Service HTTP centralisé. Base URL configurée via AppConfig.
    /// Ajoute automatiquement le token JWT si disponible.
    /// Retry 3x sur erreurs transitoires (5xx, timeout).
    /// </summary>
    public interface IApiService
    {
        Task<T?> GetAsync<T>(string endpoint, CancellationToken ct = default);
        Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest body, CancellationToken ct = default);
        Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest body, CancellationToken ct = default);
        Task<TResponse?> PatchAsync<TRequest, TResponse>(string endpoint, TRequest body, CancellationToken ct = default);
        Task<bool> DeleteAsync(string endpoint, CancellationToken ct = default);
        void SetAuthToken(string token);
        void ClearAuthToken();
    }

    public class ApiService : IApiService
    {
        private readonly HttpClient _http;
        private static readonly JsonSerializerOptions _json = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        private const int MaxRetries = 3;
        private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(1);

        public ApiService()
        {
            _http = new HttpClient
            {
                BaseAddress = new Uri(AppConfig.ServerCoreBaseUrl),
                Timeout = TimeSpan.FromSeconds(10)
            };
        }

        public void SetAuthToken(string token)
        {
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        public void ClearAuthToken()
        {
            _http.DefaultRequestHeaders.Authorization = null;
        }

        public async Task<T?> GetAsync<T>(string endpoint, CancellationToken ct = default)
        {
            await EnsureStoredJwtAsync();
            return await ExecuteWithRetry(async () =>
            {
                var response = await _http.GetAsync(endpoint, ct);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync(ct);
                return JsonSerializer.Deserialize<T>(json, _json);
            });
        }

        public async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest body, CancellationToken ct = default)
        {
            await EnsureStoredJwtAsync();
            return await ExecuteWithRetry(async () =>
            {
                var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(endpoint, content, ct);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync(ct);
                return JsonSerializer.Deserialize<TResponse>(json, _json);
            });
        }

        public async Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest body, CancellationToken ct = default)
        {
            await EnsureStoredJwtAsync();
            return await ExecuteWithRetry(async () =>
            {
                var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
                var response = await _http.PutAsync(endpoint, content, ct);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync(ct);
                return JsonSerializer.Deserialize<TResponse>(json, _json);
            });
        }

        public async Task<TResponse?> PatchAsync<TRequest, TResponse>(string endpoint, TRequest body, CancellationToken ct = default)
        {
            await EnsureStoredJwtAsync();
            return await ExecuteWithRetry(async () =>
            {
                var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
                var request = new HttpRequestMessage(HttpMethod.Patch, endpoint) { Content = content };
                var response = await _http.SendAsync(request, ct);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync(ct);
                return JsonSerializer.Deserialize<TResponse>(json, _json);
            });
        }

        public async Task<bool> DeleteAsync(string endpoint, CancellationToken ct = default)
        {
            await EnsureStoredJwtAsync();
            return await ExecuteWithRetry(async () =>
            {
                var response = await _http.DeleteAsync(endpoint, ct);
                return response.IsSuccessStatusCode;
            });
        }

        private async Task EnsureStoredJwtAsync()
        {
            try
            {
                var token = await SecureStorage.GetAsync("jwt");
                if (!string.IsNullOrWhiteSpace(token))
                {
                    SetAuthToken(token);
                }
            }
            catch
            {
                // SecureStorage can fail on some platforms in debug mode.
            }
        }

        private static async Task<T?> ExecuteWithRetry<T>(Func<Task<T?>> action)
        {
            for (int attempt = 1; attempt <= MaxRetries; attempt++)
            {
                try
                {
                    return await action();
                }
                catch (HttpRequestException ex) when (attempt < MaxRetries && IsTransient(ex))
                {
                    await Task.Delay(RetryDelay * attempt);
                }
                catch (TaskCanceledException) when (attempt < MaxRetries)
                {
                    await Task.Delay(RetryDelay * attempt);
                }
            }
            return default;
        }

        private static bool IsTransient(HttpRequestException ex)
        {
            return ex.StatusCode == null
                || (int)ex.StatusCode >= 500;
        }
    }
}
