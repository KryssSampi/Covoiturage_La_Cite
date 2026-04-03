namespace covoiturageAPI.Exceptions
{
    public class EmailAlreadyConfirmedException : BusinessException
    {
        public EmailAlreadyConfirmedException()
            : base("EMAIL_ALREADY_CONFIRMED", "Email déjà confirmé.")
        {
        }
    }
}
