using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Content;

[ApiController]
public class ContentController : ControllerBase
{
    private readonly IContentService _content;

    public ContentController(IContentService content) => _content = content;

    // ── Astuces ───────────────────────────────────────────────────────────────

    /// <summary>GET /api/astuces — Liste des astuces actives (public).</summary>
    [HttpGet("api/astuces")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAstuces(CancellationToken ct)
    {
        var astuces = await _content.GetAstucesAsync(ct);
        return Ok(ApiResponse<IEnumerable<AstuceResponseDto>>.Ok(astuces));
    }

    /// <summary>POST /api/astuces — Créer une astuce (admin).</summary>
    [HttpPost("api/astuces")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAstuce([FromBody] CreateAstuceDto dto, CancellationToken ct)
    {
        var astuce = await _content.CreateAstuceAsync(dto, ct);
        return Ok(ApiResponse<AstuceResponseDto>.Ok(astuce));
    }

    /// <summary>DELETE /api/astuces/{id} — Supprimer une astuce (admin).</summary>
    [HttpDelete("api/astuces/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAstuce(string id, CancellationToken ct)
    {
        await _content.DeleteAstuceAsync(id, ct);
        return Ok(ApiResponse.Ok("Astuce supprimée"));
    }

    // ── Nouveautés ────────────────────────────────────────────────────────────

    /// <summary>GET /api/nouveautes — Liste des nouveautés publiées (public).</summary>
    [HttpGet("api/nouveautes")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNouveautes(CancellationToken ct)
    {
        var nouveautes = await _content.GetNouveautesAsync(ct);
        return Ok(ApiResponse<IEnumerable<NouveauteResponseDto>>.Ok(nouveautes));
    }

    /// <summary>POST /api/nouveautes — Créer une nouveauté (admin).</summary>
    [HttpPost("api/nouveautes")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateNouveaute([FromBody] CreateNouveauteDto dto, CancellationToken ct)
    {
        var nouveaute = await _content.CreateNouveauteAsync(dto, ct);
        return Ok(ApiResponse<NouveauteResponseDto>.Ok(nouveaute));
    }

    /// <summary>DELETE /api/nouveautes/{id} — Supprimer une nouveauté (admin).</summary>
    [HttpDelete("api/nouveautes/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteNouveaute(string id, CancellationToken ct)
    {
        await _content.DeleteNouveauteAsync(id, ct);
        return Ok(ApiResponse.Ok("Nouveauté supprimée"));
    }
}
