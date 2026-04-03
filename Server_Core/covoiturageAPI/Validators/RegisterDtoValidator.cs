using covoiturageAPI.DTOs;
using FluentValidation;

namespace covoiturageAPI.Validators
{
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        private readonly string[] _allowedDomains;

        public RegisterDtoValidator(IConfiguration configuration)
        {
           _allowedDomains = configuration
           .GetSection("InstitutionalEmail:AllowedDomains")
            .Get<string[]>();

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .Must(BeInstitutionalEmail)
                .WithMessage("Utilisez un courriel institutionnel valide.");
        }

        private bool BeInstitutionalEmail(string email)
        {
            var domain = email.Split('@').Last();

            return _allowedDomains
                .Any(d => d.Equals(domain, StringComparison.OrdinalIgnoreCase));
        }
    }
}
