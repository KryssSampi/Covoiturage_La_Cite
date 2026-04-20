namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;

public record InitSessionResponse
{
    public string PublicId { get; init; } = null!;
    public string IdKey { get; init; } = null!;
    public DateTimeOffset ExpiresAt { get; init; }
}

public record VerifyEmailRequest
{
    public string Email { get; init; } = string.Empty;
}

public record VerifyEmailResponse
{
    public bool UserExists { get; init; }
    public bool OtpSent { get; init; }
}

public record VerifyCodeRequest
{
    public string Code { get; init; } = string.Empty;
    public string? ClientType { get; init; }
    public bool RememberOtp { get; init; }
}

public record VerifyCodeResponse
{
    public bool Success { get; init; }
    public int RemainingAttempts { get; init; }
}

public record RenewCodeResponse
{
    public bool Success { get; init; }
    public int RemainingResends { get; init; }
}

public record OtpStatusResponse
{
    public bool HasOtp { get; init; }
    public DateTimeOffset? OtpExpiresAt { get; init; }
    public DateTimeOffset? LastSentAt { get; init; }
    public int RemainingResends { get; init; }
}

public record PasswordLoginRequest
{
    public string Password { get; init; } = string.Empty;
    public string? ClientType { get; init; }
}

public record LoginResultDto
{
    public string AccessToken { get; init; } = null!;
    public DateTimeOffset AccessTokenExpiresAt { get; init; }
    public UserSummaryDto User { get; init; } = null!;
}

public record RefreshResultDto
{
    public string AccessToken { get; init; } = null!;
    public DateTimeOffset AccessTokenExpiresAt { get; init; }
    public string? RefreshToken { get; init; }
    public DateTimeOffset? RefreshTokenExpiresAt { get; init; }
}

public record RefreshRequest
{
    public string? RefreshToken { get; init; }
    public string? ClientType { get; init; }
}

public record BlockedResponse
{
    public bool IsBlocked { get; init; } = true;
    public DateTimeOffset BlockedUntil { get; init; }
    public int RemainingSeconds { get; init; }
}

public record RegisterRequest
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string? ClientType { get; init; }
}
