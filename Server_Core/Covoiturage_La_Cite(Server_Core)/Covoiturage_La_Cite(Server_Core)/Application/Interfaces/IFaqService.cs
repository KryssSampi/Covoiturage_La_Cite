using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IFaqService
{
    /// <summary>Retourne toutes les sections FAQ actives, triées par Order.</summary>
    Task<IEnumerable<FaqSectionResponseDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>Retourne une section FAQ par son ExternalId.</summary>
    Task<FaqSectionResponseDto?> GetByExternalIdAsync(string externalId, CancellationToken ct = default);

    /// <summary>Crée une section FAQ (admin uniquement).</summary>
    Task<FaqSectionResponseDto> CreateAsync(CreateFaqSectionDto dto, CancellationToken ct = default);

    /// <summary>Met à jour une section FAQ (admin uniquement).</summary>
    Task<FaqSectionResponseDto> UpdateAsync(string id, UpdateFaqSectionDto dto, CancellationToken ct = default);

    /// <summary>Supprime une section FAQ par son Id MongoDB (admin uniquement).</summary>
    Task DeleteAsync(string id, CancellationToken ct = default);
}