namespace covoiturageAPI.Models
{
    /// <summary>
    /// Cette Classe represente un utilisateur du 
    /// système
    /// </summary>
    public class User
    {
        /// <summary>
        /// Identifiant unique de l'utilisateur
        /// </summary>
        public int Id { get; set; }
        /// <summary>
        /// Prénom de l'utilisateur
        /// </summary>
        public string FirstName { get; set; }
        /// <summary>
        /// Nom de famille de l'utilisateur
        /// </summary>
        public string LastName { get; set; }
        /// <summary>
        /// Adresse courriel de connexion de l'utilisateur
        /// </summary>
        public string Email { get; set; }
        /// <summary>
        /// Numéro de téléphone de l'utilisateur
        /// </summary>
        public string Phone { get; set; }
        /// <summary>
        /// Mot de passe haché stocké en base
        /// </summary>
        public string? PasswordHash { get; set; }
        /// <summary>
        /// Type d'authentifiacation
        /// </summary>
        public string AuthType { get; set; } = "Local"; // Local ou SSO
        /// <summary>
        /// Role  de l'utilisateur
        /// </summary>
        public string Role { get; set; } = "Passenger"; // Admin / Driver / Passenger
        /// <summary>
        /// Mode conducteur 
        /// </summary>
        public bool IsDriverActive { get; set; } = false;
        /// <summary>
        /// Status du compte de l'utilisateur
        /// </summary>
        public bool IsActive { get; set; } = true;
        /// <summary>
        /// Date de creation du compte
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<RefreshToken> RefreshTokens { get; set; }
        public bool IsEmailConfirmed { get; set; } = false;
        public string? EmailConfirmationTokenHash { get; set; }
        public DateTime? EmailConfirmationTokenExpiry { get; set; }
        public int EmailResendCount { get; set; } = 0;
        public DateTime? EmailResendLastAttempt { get; set; }
        public string? StreetNumber { get; set; }
        public string? StreetName { get; set; }
        public string? Apartment { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public bool IsPublic { get; set; } = false;
    }
    
    }
