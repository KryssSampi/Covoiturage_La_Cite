namespace covoiturageAPI.Models
{
    public class RefreshToken
    {

        public int Id { get; set; }

        public string Token { get; set; }

        public DateTime Expires { get; set; }

        public bool IsRevoked { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relation avec User
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
