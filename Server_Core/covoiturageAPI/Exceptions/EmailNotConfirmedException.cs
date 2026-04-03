namespace covoiturageAPI.Exceptions
{
    public class EmailNotConfirmedException : BusinessException
    {
        public EmailNotConfirmedException()
            : base("EMAIL_NOT_CONFIRMED", "Veuillez confirmer votre email.")
        {
        }
    }
}
