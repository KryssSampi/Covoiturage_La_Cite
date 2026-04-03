namespace covoiturageAPI.DTOs
{
    /// <summary>
    /// Cette classe repréente les éléments de connexion
    /// </summary>
    public class LoginDto
    {
        /// <summary>
        /// Adresse courriel de l'utilisateur
        /// </summary>
        public string Email { get; set; }
        /// <summary>
        /// Mot de passe de l'utilisateur
        /// </summary>
        public string Password { get; set; }
    }
}
