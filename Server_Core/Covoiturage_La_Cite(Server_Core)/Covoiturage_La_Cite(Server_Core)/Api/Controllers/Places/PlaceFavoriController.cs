using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Places;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Places;

[ApiController]
[Route("api/places-favoris")]
[Authorize]
public class PlaceFavoriController : ControllerBase
{
    private readonly IPlaceFavoriService _service;

    public PlaceFavoriController(IPlaceFavoriService service)
    {
        _service = service;
    }

    /// <summary>GET /api/places-favoris — Lieux favoris de l'utilisateur connecté</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyPlaces(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var places = await _service.GetByUserAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<PlaceFavoriResponseDto>>.Ok(places));
    }

    /// <summary>POST /api/places-favoris — Créer un lieu favori</summary>
    [HttpPost]
    public async Task<IActionResult> CreatePlace([FromBody] CreatePlaceFavoriDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Pseudonyme) || string.IsNullOrWhiteSpace(dto.Adresse))
            return BadRequest(ApiResponse.Fail("Pseudonyme et adresse requis"));

        var userId = GetCurrentUserId();
        var place = await _service.CreateAsync(userId, dto, ct);
        return Created($"/api/places-favoris/{place.Id}", ApiResponse<PlaceFavoriResponseDto>.Ok(place));
    }

    /// <summary>DELETE /api/places-favoris/{id} — Supprimer un lieu favori</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlace(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        try
        {
            await _service.DeleteAsync(userId, id, ct);
            return Ok(ApiResponse.Ok("Lieu supprimé"));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse.Fail("Lieu introuvable"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
