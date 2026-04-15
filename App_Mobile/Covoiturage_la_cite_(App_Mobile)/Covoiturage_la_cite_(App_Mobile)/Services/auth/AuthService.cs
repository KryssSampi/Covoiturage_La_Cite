using System.Text.Json;
using Covoiturage_la_cite__App_Mobile_.Services.Api;

namespace Covoiturage_la_cite__App_Mobile_.Services.Auth
{
    public interface IAuthService
    {
        bool IsLoggedIn { get; }
        string? CurrentUserId { get; }
        string? CurrentToken { get; }

        Task<bool> SendOtpAsync(string phoneNumber, CancellationToken ct = default);
        Task<AuthResult> VerifyOtpAsync(string phoneNumber, string otp, CancellationToken ct = default);
        Task LogoutAsync();
    }

    public record AuthResult(bool Success, string? Token, string? UserId, string? Error);

    public class AuthService : IAuthService
    {
        private const string TokenKey = "auth_token";
        private const string UserIdKey = "auth_user_id";

        private readonly IApiService _api;

        public bool IsLoggedIn => CurrentToken != null;
        public string? CurrentUserId { get; private set; }
        public string? CurrentToken { get; private set; }

        public AuthService(IApiService api)
        {
            _api = api;
            // Restore session on startup
            _ = RestoreSessionAsync();
        }

        private async Task RestoreSessionAsync()
        {
            try
            {
                CurrentToken = await SecureStorage.GetAsync(TokenKey);
                CurrentUserId = await SecureStorage.GetAsync(UserIdKey);
                if (CurrentToken != null)
                    _api.SetAuthToken(CurrentToken);
            }
            catch
            {
                // SecureStorage can fail on some platforms in debug
            }
        }

        public async Task<bool> SendOtpAsync(string phoneNumber, CancellationToken ct = default)
        {
            var result = await _api.PostAsync<object, object>(
                "api/auth/send-otp",
                new { phoneNumber },
                ct);
            return result != null;
        }

        public async Task<AuthResult> VerifyOtpAsync(string phoneNumber, string otp, CancellationToken ct = default)
        {
            try
            {
                var response = await _api.PostAsync<object, OtpVerifyResponse>(
                    "api/auth/verify-otp",
                    new { phoneNumber, otp },
                    ct);

                if (response?.Token == null)
                    return new AuthResult(false, null, null, "Code invalide ou expiré.");

                CurrentToken = response.Token;
                CurrentUserId = response.UserId;

                _api.SetAuthToken(response.Token);

                await SecureStorage.SetAsync(TokenKey, response.Token);
                await SecureStorage.SetAsync(UserIdKey, response.UserId ?? "");

                return new AuthResult(true, response.Token, response.UserId, null);
            }
            catch (Exception ex)
            {
                return new AuthResult(false, null, null, ex.Message);
            }
        }

        public async Task LogoutAsync()
        {
            CurrentToken = null;
            CurrentUserId = null;
            _api.ClearAuthToken();

            try
            {
                SecureStorage.Remove(TokenKey);
                SecureStorage.Remove(UserIdKey);
            }
            catch { /* ignore */ }

            await Task.CompletedTask;
        }

        private class OtpVerifyResponse
        {
            public string? Token { get; set; }
            public string? UserId { get; set; }
        }
    }
}
