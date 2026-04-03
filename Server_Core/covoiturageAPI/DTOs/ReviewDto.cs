namespace covoiturageAPI.DTOs
{
    public class ReviewDto
    {
        public int ReviewedUserId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
