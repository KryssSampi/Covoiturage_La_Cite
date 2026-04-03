

    using System.Security.Claims;
    using covoiturageAPI.DTOs;
    using covoiturageAPI.Services;
    using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace covoiturageAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService, EmailService emailService, TokenService tokenService)
        {
            _authService = authService;
           
        }
        /// <summary>
        /// Route  inscription
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            if (!result)
                return Conflict(new { message = "Email déjà utilisé" });

            return Ok(new { message = "Utilisateur créé avec succès" });
        }
        /// <summary>
        /// Route connexion
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (result == null)
                return Unauthorized(new { message = "Email ou mot de passe incorrect" });

            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, //  TRUE en production
                SameSite = SameSiteMode.Strict,// None
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                accessToken = result.AccessToken,
                user = new
                {
                    result.User.Id,
                    result.User.FirstName,
                    result.User.LastName,
                    result.User.Email,
                    result.User.Role,
                    result.User.ProfileImageUrl,
                }
            });
        }
        /// <summary>
        /// Route Email confirmation
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string token)
        {
            var result = await _authService.ConfirmEmailAsync(token);

            if (!result)
                return BadRequest(new { message = "Token invalide ou expiré" });

            return Ok(new { message = "Email confirmé avec succès" });
        }
        /// <summary>
        /// route d'actualisation 
        /// </summary>
        /// <returns></returns>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (refreshToken == null)
                return Unauthorized(new { message = "Refresh token manquant" });

            var result = await _authService.RefreshAsync(refreshToken);

            if (result == null)
                return Unauthorized(new { message = "Refresh token invalide" });
           
            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                accessToken = result.AccessToken,
                user = new
                {
                    result.User.Id,
                    result.User.FirstName,
                    result.User.LastName,
                    result.User.Email,
                    result.User.Role,
                    result.User.ProfileImageUrl
                }
            });
        }
        /// <summary>
        /// Route deconnexion
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> LogoutAll()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            await _authService.LogoutAllAsync(userId);

            Response.Cookies.Delete("refreshToken");

            return Ok(new { message = "Déconnecté avec succès" });
        }
        /// <summary>
        /// Route renvoyer Email
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        [HttpPost("resend-confirmation")]
        public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto)
        {
            var result = await _authService.ResendConfirmationAsync(dto.Email);

            if (!result)
                return NotFound(new { message = "Utilisateur introuvable" });

            return Ok(new { message = "Email de confirmation renvoyé." });
        }

        /// <summary>
        /// Route Get profil
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetProfileAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("UserId introuvable dans le token");

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("UserId invalide");

            var profile = await _authService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile(ProfileDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );

            var result = await _authService.UpdateProfileAsync(userId, dto);

            if (!result)
                return NotFound();

            return Ok("Profil mis à jour");
        }
        
    }
}