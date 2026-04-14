using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Media;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Media;

/// <summary>
/// Controller for managing media storage, retrieval, and archiving
/// </summary>
[ApiController]
[Route("api/media")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IMediaStorageService _mediaService;
    private readonly ILogger<MediaController> _logger;

    public MediaController(IMediaStorageService mediaService, ILogger<MediaController> logger)
    {
        _mediaService = mediaService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a new media file
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadMedia([FromBody] CreateMediaDto createDto, CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name ?? "anonymous";
            var result = await _mediaService.UploadMediaAsync(createDto, userId, cancellationToken);

            if (result.Success)
                return Ok(ApiResponse.Ok(result.Data));
            else
                return BadRequest(ApiResponse.Fail(result.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media");
            return StatusCode(500, ApiResponse.Fail("Erreur lors du téléchargement du média"));
        }
    }

    // ... rest of controller methods archived for safekeeping
}
