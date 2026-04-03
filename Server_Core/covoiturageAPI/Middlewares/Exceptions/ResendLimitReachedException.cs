namespace covoiturageAPI.Exceptions
{
    public class ResendLimitReachedException : BusinessException
    {
        public ResendLimitReachedException()
            : base("RESEND_LIMIT_REACHED", "Limite atteinte. Réessayez demain.")
        {
        }
    }
}
