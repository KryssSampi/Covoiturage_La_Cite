using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.User;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

public class TokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>Ancien GenerateToken conservé pour compatibilité SSO (mode test).</summary>
    public string GenerateToken(UserEntity user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("microsoftSsoId", user.MicrosoftSsoId),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expiry = user.Role.ToString() == "Admin"
            ? DateTime.UtcNow.AddHours(2)
            : DateTime.UtcNow.AddDays(30);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Génère une paire Access Token (15 min) + Refresh Token (24h).
    /// Le JWT contient sub, sessionId, ip, deviceId.
    /// </summary>
    public (string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt) GenerateTokenPair(
        UserEntity user, string sessionId, string ipAddress)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var now = DateTime.UtcNow;
        var accessExpiry = now.AddHours(6);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("sessionId", sessionId),
            new Claim("ip", ipAddress),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
        };

        var accessToken = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: accessExpiry,
            signingCredentials: credentials);

        var refreshToken = GenerateRefreshToken();

        return (
            new JwtSecurityTokenHandler().WriteToken(accessToken),
            refreshToken,
            new DateTimeOffset(accessExpiry, TimeSpan.Zero)
        );
    }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
