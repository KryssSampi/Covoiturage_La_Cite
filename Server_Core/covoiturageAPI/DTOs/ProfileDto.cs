namespace covoiturageAPI.DTOs
{
    public class ProfileDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        

        public string? StreetNumber { get; set; }
        public string? StreetName { get; set; }
        public string? Apartment { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string Role { get; set; }
        public string? ProfileImageUrl { get; set; } 
        public string? Bio { get; set; }
        public bool  IsPublic { get; set; } = false;
    }
    public class PublicProfileDto
    {
        public int Id { get; set; } 
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }

        public int TotalTrips { get; set; }
        public double Rating { get; set; }
    }
}
