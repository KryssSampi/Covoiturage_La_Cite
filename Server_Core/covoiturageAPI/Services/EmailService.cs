using SendGrid;
using SendGrid.Helpers.Mail;

namespace covoiturageAPI.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var apiKey = _config["SendGridSettings:ApiKey"];
            var senderEmail = _config["SendGridSettings:SenderEmail"];
            var senderName = _config["SendGridSettings:SenderName"];

            var client = new SendGridClient(apiKey);

            var from = new EmailAddress(senderEmail, senderName);
            var to = new EmailAddress(toEmail);

            var msg = MailHelper.CreateSingleEmail(
                from,
                to,
                subject,
                plainTextContent: null,
                htmlContent: htmlContent
            );

            await client.SendEmailAsync(msg);
        }
    }
}