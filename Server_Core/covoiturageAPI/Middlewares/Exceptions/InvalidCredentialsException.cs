namespace covoiturageAPI.Exceptions
{
    public class InvalidCredentialsException : BusinessException
    {
        public InvalidCredentialsException()
            : base("INVALID_CREDENTIALS", "Email ou mot de passe incorrect")
        {
        }
    }
}
