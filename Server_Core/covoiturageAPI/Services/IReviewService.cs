using covoiturageAPI.DTOs;
using covoiturageAPI.Models;

namespace covoiturageAPI.Services
{
    public interface IReviewService
    {
        Task<(bool Success, string Message)> CreateReview(int reviewerId, ReviewDto dto);
        Task<(List<Review> Reviews, double Average)> GetUserReviews(int userId);
    }
}
