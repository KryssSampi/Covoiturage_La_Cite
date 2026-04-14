using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Content;

[ApiController]
public class FaqController : ControllerBase
{
    private readonly IFaqService _faq;

    public FaqController(IFaqService faq) => _faq = faq;

    // ── FAQ (public) ───────────────────────────────────────────────────────────

    /// <summary>GET /api/faq — Liste des sections FAQ actives (public).</summary>
    [HttpGet("api/faq")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFaqs(CancellationToken ct)
    {
        var sections = await _faq.GetAllAsync(ct);
        return Ok(ApiResponse<IEnumerable<FaqSectionResponseDto>>.Ok(sections));
    }

    /// <summary>GET /api/faq/{externalId} — Une section FAQ par son identifiant (public).</summary>
    [HttpGet("api/faq/{externalId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFaqByExternalId(string externalId, CancellationToken ct)
    {
        var section = await _faq.GetByExternalIdAsync(externalId, ct);
        if (section == null)
            return NotFound(ApiResponse.NotFound($"Section FAQ '{externalId}' introuvable"));

        return Ok(ApiResponse<FaqSectionResponseDto>.Ok(section));
    }

    // ── FAQ (admin) ────────────────────────────────────────────────────────────

    /// <summary>POST /api/faq — Créer une section FAQ (admin).</summary>
    [HttpPost("api/faq")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateFaq([FromBody] CreateFaqSectionDto dto, CancellationToken ct)
    {
        var section = await _faq.CreateAsync(dto, ct);
        return Ok(ApiResponse<FaqSectionResponseDto>.Ok(section));
    }

    /// <summary>PATCH /api/faq/{id} — Mettre à jour une section FAQ (admin).</summary>
    [HttpPatch("api/faq/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateFaq(string id, [FromBody] UpdateFaqSectionDto dto, CancellationToken ct)
    {
        var section = await _faq.UpdateAsync(id, dto, ct);
        return Ok(ApiResponse<FaqSectionResponseDto>.Ok(section));
    }

    /// <summary>DELETE /api/faq/{id} — Supprimer une section FAQ (admin).</summary>
    [HttpDelete("api/faq/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFaq(string id, CancellationToken ct)
    {
        await _faq.DeleteAsync(id, ct);
        return Ok(ApiResponse.Ok("Section FAQ supprimée"));
    }
}