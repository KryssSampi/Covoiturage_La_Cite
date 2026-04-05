using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IContentService
{
    // ── Astuces ───────────────────────────────────────────────────────────────

    /// <summary>Retourne toutes les astuces actives, triées par Order.</summary>
    Task<IEnumerable<AstuceResponseDto>> GetAstucesAsync(CancellationToken ct = default);

    /// <summary>Crée une astuce (admin uniquement).</summary>
    Task<AstuceResponseDto> CreateAstuceAsync(CreateAstuceDto dto, CancellationToken ct = default);

    /// <summary>Supprime une astuce par son Id MongoDB.</summary>
    Task DeleteAstuceAsync(string id, CancellationToken ct = default);

    // ── Nouveautés ────────────────────────────────────────────────────────────

    /// <summary>Retourne toutes les nouveautés publiées, triées antéchronologiquement.</summary>
    Task<IEnumerable<NouveauteResponseDto>> GetNouveautesAsync(CancellationToken ct = default);

    /// <summary>Crée une nouveauté (admin uniquement).</summary>
    Task<NouveauteResponseDto> CreateNouveauteAsync(CreateNouveauteDto dto, CancellationToken ct = default);

    /// <summary>Supprime une nouveauté par son Id MongoDB.</summary>
    Task DeleteNouveauteAsync(string id, CancellationToken ct = default);
}
