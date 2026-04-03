namespace covoiturageAPI.Models
{
    public class Review
    {
        public int Id { get; set; }

        public string UserId { get; set; } = "";
        public int ReviewedUserId { get; set; }
        public int ReviewerId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; }

    }
}
