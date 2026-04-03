//namespace covoiturageAPI.Services
//{
//    using covoiturageAPI.Data;
//    using covoiturageAPI.DTOs;
//    using covoiturageAPI.Models;
//    using CovoiturageAPI.Data;
//    using Microsoft.EntityFrameworkCore;

//    public class ReviewService : IReviewService
//    {
//        private readonly ApplicationDbContext _context;

//        public ReviewService(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<(bool Success, string Message)> CreateReview(int reviewerId, ReviewDto dto)
//        {
//            // 🚫 empêcher double note
//            var exists = await _context.Reviews.AnyAsync(r =>
//                r.ReviewerId == reviewerId &&
//                r.ReviewedUserId == dto.ReviewedUserId
//            );

//            if (exists)
//                return (false, "Vous avez déjà évalué cet utilisateur");

//            // 🔐 vérifier trajet terminé
//            var hasTrip = await _context.Trips.AnyAsync(t =>
//    t.Status == "Completed" &&
//    (
//        (t.DriverId == reviewerId &&
//         t.Passengers.Any(p => p.PassengerId == dto.ReviewedUserId))
//        ||
//        (t.DriverId == dto.ReviewedUserId &&
//         t.Passengers.Any(p => p.PassengerId == reviewerId))
//    )
//);

//            if (!hasTrip)
//                return (false, "Vous devez compléter un trajet avant d’évaluer");

//            // ⭐ validation note
//            if (dto.Rating < 1 || dto.Rating > 5)
//                return (false, "Note invalide");

//            var review = new Reviews
//            {
//                ReviewerId = reviewerId,
//                ReviewedUserId = dto.ReviewedUserId,
//                Rating = dto.Rating,
//                Comment = dto.Comment,
//                CreatedAt = DateTime.UtcNow
//            };

//            _context.Reviews.Add(review);
//            await _context.SaveChangesAsync();

//            return (true, "Évaluation envoyée");
//        }

//        public async Task<(List<Review> Reviews, double Average)> GetUserReviews(int userId)
//        {
//            var reviews = await _context.Reviews
//                .Where(r => r.ReviewedUserId == userId)
//                .ToListAsync();

//            var average = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

//            return (reviews, average);
//        }
//    }
//}
