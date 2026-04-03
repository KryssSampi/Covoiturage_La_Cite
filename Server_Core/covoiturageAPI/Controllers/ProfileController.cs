using System.Security.Claims;
using covoiturageAPI.DTOs;
using covoiturageAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace covoiturageAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [Authorize]
    [HttpPost("upload-photo")]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var result = await _profileService.UploadProfilePhotoAsync(userIdClaim, file);

        if (!result.Success)
            return BadRequest(result.Error);

        return Ok(new { imageUrl = result.ImageUrl });
    }
    //  CHANGER MOT DE PASSE
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Utilisateur non authentifié" });

            await _profileService.ChangePassword(userId, dto);

            return Ok(new { message = "Mot de passe modifié avec succès 🔐" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    //  PROFIL PUBLIC
    [HttpGet("public/{id}")]
    public async Task<IActionResult> GetPublicProfile(string id)
    {
        try
        {
            var profile = await _profileService.GetPublicProfile(id);

            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
