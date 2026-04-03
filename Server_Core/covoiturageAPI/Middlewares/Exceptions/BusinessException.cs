namespace covoiturageAPI.Exceptions
{
    public abstract class BusinessException : Exception
    {
        public string Code { get; }

        protected BusinessException(string code, string message)
            : base(message)
        {
            Code = code;
        }
    }
}
