using System.Security.Cryptography;
using System.Text;
using covoiturageAPI.Models;
using CovoiturageAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace covoiturageAPI.Services
{
    public class RefreshTokenService
    {
        private readonly ApplicationDbContext _context;

        public RefreshTokenService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> CreateAsync(int userId)
        {
            var token = GenerateRefreshToken();
            var hashedToken = HashToken(token);

            var refreshTokenEntity = new RefreshToken
            {
                Token = hashedToken,
                Expires = DateTime.UtcNow.AddDays(7),
                UserId = userId
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return token; // on retourne le token brut au client
        }

        public async Task<(User user, string newRefreshToken)?> RefreshAsync(string token)
        {
            var hashedToken = HashToken(token);

            var storedToken = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == hashedToken);

            if (storedToken == null ||
                storedToken.IsRevoked ||
                storedToken.Expires < DateTime.UtcNow)
                return null;

            // Rotation
            storedToken.IsRevoked = true;

            var newToken = GenerateRefreshToken();
            var newHashedToken = HashToken(newToken);

            var newTokenEntity = new RefreshToken
            {
                Token = newHashedToken,
                Expires = DateTime.UtcNow.AddDays(7),
                UserId = storedToken.UserId
            };

            _context.RefreshTokens.Add(newTokenEntity);

            await _context.SaveChangesAsync();

            return (storedToken.User, newToken);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(randomBytes);
        }

        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
        public async Task RevokeAllAsync(int userId)
        {
            var tokens = await _context.RefreshTokens
                .Where(r => r.UserId == userId && !r.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}