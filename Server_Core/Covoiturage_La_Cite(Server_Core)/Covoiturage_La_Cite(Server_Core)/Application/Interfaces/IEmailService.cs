namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IEmailService
{
    Task SendOtpAsync(string toEmail, string otpCode, CancellationToken ct = default);
}
