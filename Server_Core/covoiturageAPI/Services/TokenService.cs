using System.Security.Cryptography;
using System.Text;

namespace covoiturageAPI.Services
{
    public class TokenService
    {
        public string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}