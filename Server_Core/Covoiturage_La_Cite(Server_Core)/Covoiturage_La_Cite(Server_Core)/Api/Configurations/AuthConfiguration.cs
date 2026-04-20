using Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Covoiturage_La_Cite_Server_Core_.Api.Configurations;

public static class AuthConfiguration
{
    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration configuration)
    {
        var rsaPublicKey = JwtRsaKeyStore.GetPublicKey();
        const string issuer = "covoiturage-la-cite-server";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudiences = new[] { "mobile-client", "web-client" },
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = rsaPublicKey,
                ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 },
                ClockSkew = TimeSpan.FromMinutes(2)
            };
        });

        services.AddAuthorization();
        return services;
    }
}
