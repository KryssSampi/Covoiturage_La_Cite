using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using UserEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.User;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

public class TokenService
{
    private const string Issuer = "covoiturage-la-cite-server";

    /// <summary>Legacy method kept for compatibility.</summary>
    public string GenerateToken(UserEntity user)
    {
        var signingCredentials = new SigningCredentials(JwtRsaKeyStore.GetPrivateKey(), SecurityAlgorithms.RsaSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("microsoftSsoId", user.MicrosoftSsoId),
            new Claim("client_type", "web"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: "web-client",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (string AccessToken, string RefreshToken, DateTimeOffset AccessExpiresAt, DateTimeOffset RefreshExpiresAt) GenerateTokenPair(
        UserEntity user,
        string sessionId,
        string ipAddress,
        string clientType)
    {
        var normalizedClientType = string.Equals(clientType, "mobile", StringComparison.OrdinalIgnoreCase)
            ? "mobile"
            : "web";

        var signingCredentials = new SigningCredentials(JwtRsaKeyStore.GetPrivateKey(), SecurityAlgorithms.RsaSha256);

        var now = DateTime.UtcNow;
        var accessExpiry = normalizedClientType == "mobile"
            ? now.AddMinutes(10080)
            : now.AddMinutes(60);

        var refreshExpiry = normalizedClientType == "mobile"
            ? now.AddMinutes(4320)
            : now.AddMinutes(1440);

        var audience = normalizedClientType == "mobile" ? "mobile-client" : "web-client";

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("sessionId", sessionId),
            new Claim("ip", ipAddress),
            new Claim("client_type", normalizedClientType),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
        };

        var accessToken = new JwtSecurityToken(
            issuer: Issuer,
            audience: audience,
            claims: claims,
            expires: accessExpiry,
            signingCredentials: signingCredentials);

        var refreshToken = GenerateRefreshToken();

        return (
            new JwtSecurityTokenHandler().WriteToken(accessToken),
            refreshToken,
            new DateTimeOffset(accessExpiry, TimeSpan.Zero),
            new DateTimeOffset(refreshExpiry, TimeSpan.Zero)
        );
    }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
