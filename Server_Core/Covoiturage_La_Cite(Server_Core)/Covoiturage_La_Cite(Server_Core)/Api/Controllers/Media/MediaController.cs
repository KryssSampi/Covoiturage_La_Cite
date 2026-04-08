using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Media;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Media;

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

    [HttpPost("upload")]
    public async Task<IActionResult> UploadMedia([FromBody] CreateMediaDto createDto, CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name ?? "anonymous";
            var result = await _mediaService.UploadMediaAsync(createDto, userId, cancellationToken);
            return Ok(ApiResponse<MediaStorageResponseDto>.Ok(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media");
            return StatusCode(500, ApiResponse.Fail("Erreur lors du téléchargement du média"));
        }
    }

    [HttpGet("{mediaId}")]
    public async Task<IActionResult> GetMedia([FromRoute] Guid mediaId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mediaService.GetMediaAsync(mediaId, cancellationToken);
            if (result is null)
                return NotFound(ApiResponse.NotFound("Média non trouvé"));
            return Ok(ApiResponse<MediaStorageResponseDto>.Ok(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving media {MediaId}", mediaId);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la récupération du média"));
        }
    }

    [HttpPatch("{mediaId}")]
    public async Task<IActionResult> UpdateMedia([FromRoute] Guid mediaId, [FromBody] UpdateMediaDto updateDto, CancellationToken cancellationToken)
    {
        try
        {
            var success = await _mediaService.UpdateMediaAsync(mediaId, updateDto, cancellationToken);
            if (success)
                return Ok(ApiResponse.Ok("Média mis à jour"));
            return BadRequest(ApiResponse.Fail("Échec de la mise à jour du média"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating media {MediaId}", mediaId);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la mise à jour du média"));
        }
    }

    [HttpPost("{mediaId}/archive")]
    public async Task<IActionResult> ArchiveMedia([FromRoute] Guid mediaId, [FromBody] ArchiveMediaDto archiveDto, CancellationToken cancellationToken)
    {
        try
        {
            var success = await _mediaService.ArchiveMediaAsync(mediaId, archiveDto, cancellationToken);
            if (success)
                return Ok(ApiResponse.Ok("Média archivé"));
            return BadRequest(ApiResponse.Fail("Échec de l'archivage du média"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving media {MediaId}", mediaId);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de l'archivage du média"));
        }
    }

    [HttpPost("{mediaId}/restore")]
    public async Task<IActionResult> RestoreMedia([FromRoute] Guid mediaId, [FromBody] RestoreMediaDto restoreDto, CancellationToken cancellationToken)
    {
        try
        {
            var success = await _mediaService.RestoreMediaAsync(mediaId, restoreDto, cancellationToken);
            if (success)
                return Ok(ApiResponse.Ok("Média restauré"));
            return BadRequest(ApiResponse.Fail("Échec de la restauration du média"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring media {MediaId}", mediaId);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la restauration du média"));
        }
    }

    [HttpDelete("{mediaId}")]
    public async Task<IActionResult> DeleteMedia([FromRoute] Guid mediaId, CancellationToken cancellationToken)
    {
        try
        {
            var success = await _mediaService.DeleteMediaPermanentlyAsync(mediaId, cancellationToken);
            if (success)
                return Ok(ApiResponse.Ok("Média supprimé définitivement"));
            return BadRequest(ApiResponse.Fail("Échec de la suppression du média"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting media {MediaId}", mediaId);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la suppression du média"));
        }
    }

    [HttpGet("query")]
    public async Task<IActionResult> QueryMedia([FromQuery] MediaQueryParams queryParams, CancellationToken cancellationToken)
    {
        try
        {
            var results = await _mediaService.QueryMediaAsync(queryParams, cancellationToken);
            return Ok(ApiResponse<List<MediaStorageResponseDto>>.Ok(results));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying media");
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la recherche de médias"));
        }
    }

    [HttpGet("{mediaId}/logs")]
    public async Task<IActionResult> GetMediaLogs([FromRoute] Guid mediaId, CancellationToken cancellationToken)
    {
        try
        {
            var logs = await _mediaService.GetMediaLogsAsync(mediaId, cancellationToken);
            return Ok(ApiResponse<List<MediaLogDto>>.Ok(logs));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs for media {MediaId}", mediaId);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la récupération des logs"));
        }
    }

    [HttpGet("logs/sector/{sector}")]
    public async Task<IActionResult> GetLogsBySector([FromRoute] string sector, [FromQuery] int limit = 100, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await _mediaService.GetLogsBySectorAsync(sector, limit, cancellationToken);
            return Ok(ApiResponse<List<MediaLogDto>>.Ok(logs));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs for sector {Sector}", sector);
            return StatusCode(500, ApiResponse.Fail("Erreur lors de la récupération des logs par secteur"));
        }
    }

    [HttpPost("maintenance/archive-old")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ArchiveOldMedia([FromBody] ArchiveOldMediaDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var olderThan = DateTimeOffset.UtcNow.AddDays(-dto.DaysThreshold);
            var count = await _mediaService.ArchiveOldMediaAsync(olderThan, cancellationToken);
            return Ok(ApiResponse<int>.Ok(count, $"{count} médias archivés"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving old media");
            return StatusCode(500, ApiResponse.Fail("Erreur lors de l'archivage des anciens médias"));
        }
    }

    [HttpPost("maintenance/cleanup")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CleanupDeletedMedia(CancellationToken cancellationToken)
    {
        try
        {
            var count = await _mediaService.CleanupDeletedMediaAsync(cancellationToken);
            return Ok(ApiResponse<int>.Ok(count, $"{count} médias nettoyés"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up deleted media");
            return StatusCode(500, ApiResponse.Fail("Erreur lors du nettoyage des médias supprimés"));
        }
    }
}

public record ArchiveOldMediaDto
{
    public int DaysThreshold { get; init; } = 90;
}
