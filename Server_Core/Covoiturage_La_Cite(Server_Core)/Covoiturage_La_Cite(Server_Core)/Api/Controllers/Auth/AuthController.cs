using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public AuthController(IUserService userService, IConfiguration configuration)
    {
        _userService = userService;
        _configuration = configuration;
    }

    /// <summary>
    /// POST /api/auth/sso-callback — Échange un token Microsoft Azure AD contre un JWT interne.
    /// Crée automatiquement l'utilisateur s'il n'existe pas (domaines collège autorisés + matricule numérique requis).
    /// </summary>
    [HttpPost("sso-callback")]
    public async Task<IActionResult> SsoCallback([FromBody] SsoCallbackRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
            return BadRequest(ApiResponse.Fail("idToken requis"));

        var result = await _userService.AuthenticateWithSsoAsync(request.IdToken, ct);
        return Ok(ApiResponse<AuthResultDto>.Ok(result));
    }

    /// <summary>
    /// POST /api/auth/signin — Authentification simplifiée (ISTESTMODE uniquement).
    /// Accepte un email institutionnel, retourne un JWT sans validation Microsoft SSO.
    /// Cette route n'existe pas en production (retourne 404 si ISTESTMODE=false).
    /// </summary>
    [HttpPost("signin")]
    public async Task<IActionResult> TestSignin([FromBody] TestSigninRequest request, CancellationToken ct)
    {
        var isTestMode = _configuration.GetValue<bool>("IsTestMode");
        if (!isTestMode)
            return NotFound(ApiResponse.Fail("Route non disponible en production"));

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(ApiResponse.Fail("Email requis"));

        var result = await _userService.AuthenticateWithEmailTestModeAsync(request.Email, ct);
        return Ok(ApiResponse<AuthResultDto>.Ok(result));
    }
}
