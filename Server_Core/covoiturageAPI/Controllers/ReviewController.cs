namespace covoiturageAPI.Controllers
{
    using covoiturageAPI.DTOs;
    using covoiturageAPI.Services;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Route("api/reviews")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] ReviewDto dto)
        {
            // récupérer user connecté
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _reviewService.CreateReview(userId, dto);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReviews(int userId)
        {
            var (reviews, average) = await _reviewService.GetUserReviews(userId);

            return Ok(new
            {
                reviews,
                average
            });
        }
    }

}
