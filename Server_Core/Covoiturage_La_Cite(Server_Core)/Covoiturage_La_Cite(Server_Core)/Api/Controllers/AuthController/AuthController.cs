using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AuthController;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config) => _config = config;

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var adminEmail = _config["AdminCredentials:Email"];
        var adminPassword = _config["AdminCredentials:Password"];

        if (request.Email != adminEmail || request.Password != adminPassword)
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        var token = GenerateJwt(request.Email, "Admin");
        return Ok(new { access_token = token });
    }

    private string GenerateJwt(string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiryMinutes"] ?? "10080"));

        var claims = new[]
        {
            new Claim("email", email),
            new Claim("role", role),
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
