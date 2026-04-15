namespace Covoiturage_la_cite__App_Mobile_.Core.Viewmodels
{
    /// <summary>DTO retourné par GET /api/users/me</summary>
    public class UserDto
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Initials { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Role { get; set; }
        public bool CanBeDriver { get; set; }
        public bool ProfileVerified { get; set; }
        public int GoScore { get; set; }
    }
}
