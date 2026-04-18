using Covoiturage_la_cite__App_Mobile_.Services.Api;
using System.Text.Json;

namespace Covoiturage_la_cite__App_Mobile_.Services.Auth;

public class AuthServiceHttp : IAuthService
{
    private const string JwtKey = "jwt";
    private readonly IApiService _api;

    public bool IsLoggedIn => !string.IsNullOrWhiteSpace(CurrentToken);
    public string? CurrentUserId { get; private set; }
    public string? CurrentToken { get; private set; }

    public AuthServiceHttp(IApiService api)
    {
        _api = api;
        _ = RestoreSessionAsync();
    }

    private async Task RestoreSessionAsync()
    {
        try
        {
            CurrentToken = await SecureStorage.GetAsync(JwtKey);
            if (!string.IsNullOrWhiteSpace(CurrentToken))
                _api.SetAuthToken(CurrentToken);
        }
        catch
        {
            // Ignore SecureStorage issues in debug/emulators.
        }
    }

    public async Task<bool> SendOtpAsync(string phoneNumber, CancellationToken ct = default)
    {
        var body = new { phoneNumber };
        var payload = await _api.PostAsync<object, JsonElement>("api/auth/login", body, ct);
        var result = ParseAuthPayload(payload);

        if (!string.IsNullOrWhiteSpace(result.Token))
            await PersistTokenAsync(result.Token, result.UserId);

        return result.Success;
    }

    public async Task<AuthResult> VerifyOtpAsync(string phoneNumber, string otp, CancellationToken ct = default)
    {
        try
        {
            var body = new { phoneNumber, otp };
            var payload = await _api.PostAsync<object, JsonElement>("api/auth/otp", body, ct);
            var result = ParseAuthPayload(payload);
            var token = result.Token;
            var userId = result.UserId;

            if (string.IsNullOrWhiteSpace(token))
                return new AuthResult(false, null, null, result.Message ?? "Code OTP invalide.");

            await PersistTokenAsync(token, userId);
            return new AuthResult(true, token, userId, null);
        }
        catch (Exception ex)
        {
            return new AuthResult(false, null, null, ex.Message);
        }
    }

    public async Task LogoutAsync()
    {
        try
        {
            _ = await _api.PostAsync<object, JsonElement>("api/auth/logout", new { }, CancellationToken.None);
        }
        catch
        {
            // Local logout must still complete if remote logout fails.
        }

        CurrentToken = null;
        CurrentUserId = null;
        _api.ClearAuthToken();

        try
        {
            SecureStorage.Remove(JwtKey);
        }
        catch
        {
            // Ignore SecureStorage issues.
        }
    }

    private async Task PersistTokenAsync(string token, string? userId)
    {
        CurrentToken = token;
        CurrentUserId = userId;
        _api.SetAuthToken(token);
        await SecureStorage.SetAsync(JwtKey, token);
    }

    private static ParsedAuthPayload ParseAuthPayload(JsonElement? payload)
    {
        if (payload is null || payload.Value.ValueKind == JsonValueKind.Undefined || payload.Value.ValueKind == JsonValueKind.Null)
            return new ParsedAuthPayload(false, null, null, "Réponse vide.");

        var root = payload.Value;
        var success = GetBool(root, "success") ?? false;
        var message = GetString(root, "message");

        var data = GetObject(root, "data") ?? root;
        var token = GetString(data, "token") ?? GetString(data, "jwt") ?? GetString(data, "accessToken");
        var userId = GetString(data, "userId") ?? GetString(data, "id");

        // Fallback pour payload direct sans "success"
        if (!success && !string.IsNullOrWhiteSpace(token))
            success = true;

        return new ParsedAuthPayload(success, token, userId, message);
    }

    private static JsonElement? GetObject(JsonElement root, string propertyName)
    {
        if (!TryGetPropertyIgnoreCase(root, propertyName, out var value))
            return null;
        return value.ValueKind == JsonValueKind.Object ? value : null;
    }

    private static bool? GetBool(JsonElement root, string propertyName)
    {
        if (!TryGetPropertyIgnoreCase(root, propertyName, out var value))
            return null;
        if (value.ValueKind == JsonValueKind.True) return true;
        if (value.ValueKind == JsonValueKind.False) return false;
        return null;
    }

    private static string? GetString(JsonElement root, string propertyName)
    {
        if (!TryGetPropertyIgnoreCase(root, propertyName, out var value))
            return null;
        if (value.ValueKind == JsonValueKind.String) return value.GetString();
        return value.ValueKind == JsonValueKind.Number ? value.ToString() : null;
    }

    private static bool TryGetPropertyIgnoreCase(JsonElement root, string propertyName, out JsonElement value)
    {
        foreach (var property in root.EnumerateObject())
        {
            if (string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase))
            {
                value = property.Value;
                return true;
            }
        }

        value = default;
        return false;
    }

    private sealed record ParsedAuthPayload(bool Success, string? Token, string? UserId, string? Message);
}
