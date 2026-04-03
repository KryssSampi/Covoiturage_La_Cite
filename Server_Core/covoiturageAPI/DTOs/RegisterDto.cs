namespace covoiturageAPI.DTOs
{
    /// <summary>
    /// Represente les information necessaire pour 
    /// l'inscription d'un utilisateur
    /// </summary>
    public class RegisterDto
    {
        /// <summary>
        /// Prénom de l'utilisateur
        /// </summary>
        public string FirstName {  get; set; }
        /// <summary>
        /// Nom de l'utilisateur
        /// </summary>
        public string LastName { get; set; }
        /// <summary>
        /// Adresse couriel de l'utilisateur
        /// </summary>
        public string Email { get; set; }
        /// <summary>
        /// Numero de téléphone de l'utilisateur
        /// </summary>
        public string Phone { get; set; }
        /// <summary>
        /// Mot de passe du compte(minium 8 caractèes)
        /// </summary>
        public string Password { get; set; }
    }
}
