
using System.Security.Cryptography;
using covoiturageAPI.DTOs;
using covoiturageAPI.Exceptions;
using covoiturageAPI.Helpers;
using covoiturageAPI.Models;
using CovoiturageAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace covoiturageAPI.Services
{
    public class AuthResult
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public ProfileDto User { get; set; }
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;
        private readonly RefreshTokenService _refreshService;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;
        private readonly TokenService _tokenService;

        public AuthService(
            ApplicationDbContext context,
            JwtService jwtService,
            RefreshTokenService refreshService,
            IConfiguration configuration,
            EmailService emailService, TokenService tokenService )
        {
            _context = context;
            _jwtService = jwtService;
            _refreshService = refreshService;
            _configuration = configuration;
            _emailService = emailService;
            _tokenService = tokenService;
        }

        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists)
                return false;

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsEmailConfirmed = false
            };

            // 🔐 Génération token brut
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            // 🔐 Hash avec TA méthode
            var hashedToken = _tokenService.HashToken(rawToken);

            user.EmailConfirmationTokenHash = hashedToken;
            user.EmailConfirmationTokenExpiry = DateTime.UtcNow.AddHours(24);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            //  Lien dynamique 
            var frontendUrl = _configuration["Frontend:BaseUrl"];
            var confirmationLink = $"{frontendUrl}/confirm-email?token={rawToken}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Confirmation de votre compte",
                $@"
        <h2>Bonjour {user.FirstName}</h2>
        <p>Cliquez ici pour confirmer votre compte :</p>
        <a href='{confirmationLink}'>Confirmer mon compte</a>
        <p>Ce lien expire dans 24 heures.</p>
        "
            );

            return true;
        }
        public async Task<bool> ConfirmEmailAsync(string token)
        {
            var hashedToken = _tokenService.HashToken(token);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmailConfirmationTokenHash == hashedToken);

            if (user == null)
                return false;

            if (user.EmailConfirmationTokenExpiry < DateTime.UtcNow)
                return false;

            user.IsEmailConfirmed = true;
            user.EmailConfirmationTokenHash = null;
            user.EmailConfirmationTokenExpiry = null;

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<AuthResult?> LoginAsync(LoginDto dto)
        {
            
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);
           
            if (user == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;
            //  BLOQUER SI EMAIL NON CONFIRMÉ
            if (!user.IsEmailConfirmed)
                throw new EmailNotConfirmedException();
           // throw new UnauthorizedAccessException("Veuillez confirmer votre email.");

            var accessToken = _jwtService.GenerateToken(user);

            //  Délégation au RefreshTokenService
            var refreshToken = await _refreshService.CreateAsync(user.Id);

            return new AuthResult
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new ProfileDto
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user .Role,
                    ProfileImageUrl = user.ProfileImageUrl
                }
            };
        }
        /// <summary>
        /// Fonction refresh token
        /// </summary>
        /// <param name="refreshToken"></param>
        /// <returns></returns>
        public async Task<AuthResult?> RefreshAsync(string refreshToken)
        {
            var result = await _refreshService.RefreshAsync(refreshToken);

            if (result == null)
                return null;

            var (user, newRefreshToken) = result.Value;

            user = await _context.Users.FindAsync(user.Id);

            var newAccessToken = _jwtService.GenerateToken(user);

            return new AuthResult
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new ProfileDto
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role,
                    ProfileImageUrl = user.ProfileImageUrl
                }
            };
        }
        /// <summary>
        /// Fonction déconnectée
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public async Task LogoutAllAsync(int userId)
        {
            await _refreshService.RevokeAllAsync(userId);
        }
        /// <summary>
        /// Genération du token de confirmation Email
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public string GenerateEmailConfirmationToken(User user)
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }

        /// <summary>
        /// Fonction reset email
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<bool> ResendConfirmationAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return false;

            if (user.IsEmailConfirmed)
            throw new EmailAlreadyConfirmedException();
            //throw new Exception("Email déjà confirmé.");

            // Reset compteur si nouveau jour
            if (user.EmailResendLastAttempt == null ||
                user.EmailResendLastAttempt.Value.Date < DateTime.UtcNow.Date)
            {
                user.EmailResendCount = 0;
            }

            if (user.EmailResendCount >= 3)
            throw new ResendLimitReachedException();
            // throw new Exception("Limite atteinte. Réessayez demain.");

            user.EmailResendCount++;
            user.EmailResendLastAttempt = DateTime.UtcNow;

            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var hashedToken = _tokenService.HashToken(rawToken);

            user.EmailConfirmationTokenHash = hashedToken;
            user.EmailConfirmationTokenExpiry = DateTime.UtcNow.AddHours(24);

            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["Frontend:BaseUrl"];
            var confirmationLink = $"{frontendUrl}/confirm-email?token={rawToken}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Confirmation de votre compte",
                $@"
        <h2>Bonjour {user.FirstName}</h2>
        <p>Cliquez ici pour confirmer votre couriel :</p>
        <a href='{confirmationLink}'>Confirmer mon compte</a>
        "
            );

            return true;
        }
        /// <summary>
        /// Recharger Profil
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public async Task<ProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return null;

            return new ProfileDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                StreetNumber = user.StreetNumber,
                StreetName = user.StreetName,
                Apartment = user.Apartment,
                City = user.City,
                Province = user.Province,
                PostalCode = user.PostalCode,
                Country = user.Country,
                ProfileImageUrl = user.ProfileImageUrl,
                Bio= user.Bio,
                IsPublic = user.IsPublic,
            };
        }
        /// <summary>
        /// Modifier Profil
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        public async Task<bool> UpdateProfileAsync(int userId, ProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email= dto.Email;
            user.Phone = dto.Phone;
            user.StreetNumber = dto.StreetNumber;
            user.Role = dto.Role;
            user.StreetName = dto.StreetName;
            user.Apartment = dto.Apartment;
            user.City = dto.City;
            user.Province = dto.Province;
            user.PostalCode = dto.PostalCode;
            user.Country = dto.Country;
            user.ProfileImageUrl = dto.ProfileImageUrl;
            user.Bio = dto.Bio;
            user.IsPublic = dto.IsPublic;

            await _context.SaveChangesAsync();

            return true;
        }

    }
}

