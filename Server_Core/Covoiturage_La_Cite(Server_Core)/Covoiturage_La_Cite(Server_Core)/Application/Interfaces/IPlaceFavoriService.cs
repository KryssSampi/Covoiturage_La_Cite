using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Places;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IPlaceFavoriService
{
    Task<IEnumerable<PlaceFavoriResponseDto>> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task<PlaceFavoriResponseDto> CreateAsync(Guid userId, CreatePlaceFavoriDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid userId, Guid placeId, CancellationToken ct = default);
}
