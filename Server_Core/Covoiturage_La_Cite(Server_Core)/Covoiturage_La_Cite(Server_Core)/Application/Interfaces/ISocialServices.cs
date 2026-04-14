using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Social;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewResponseDto> CreateAsync(Guid reviewerId, CreateReviewDto dto, CancellationToken ct = default);
    Task<IEnumerable<ReviewResponseDto>> GetReceivedReviewsAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<ReviewResponseDto>> GetGivenReviewsAsync(Guid userId, CancellationToken ct = default);
    Task<double> GetAverageRatingAsync(Guid userId, CancellationToken ct = default);
}

public interface IAffinityService
{
    Task<IEnumerable<AffinityResponseDto>> GetFavoritesAsync(Guid userId, CancellationToken ct = default);
    Task<AffinityResponseDto> ToggleFavoriteAsync(Guid userId, Guid targetUserId, CancellationToken ct = default);
    Task<AffinityResponseDto> BlockUserAsync(Guid userId, Guid targetUserId, CancellationToken ct = default);
    Task<AffinityResponseDto> UnblockUserAsync(Guid userId, Guid targetUserId, CancellationToken ct = default);
    Task<IEnumerable<AffinityResponseDto>> GetTopAffinitiesAsync(Guid userId, int top = 10, CancellationToken ct = default);
}

public interface IReportService
{
    Task<ReportResponseDto> CreateAsync(Guid reporterId, CreateReportDto dto, CancellationToken ct = default);
    Task<IEnumerable<ReportResponseDto>> GetMyReportsAsync(Guid userId, CancellationToken ct = default);
    Task<ReportResponseDto?> GetByReferenceAsync(string publicReference, CancellationToken ct = default);
}
