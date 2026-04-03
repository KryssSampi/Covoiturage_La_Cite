using covoiturageAPI.DTOs;
using CovoiturageAPI.Data;
using Microsoft.EntityFrameworkCore;
using covoiturageAPI.Profiles;


namespace covoiturageAPI.Services
{
    public class ProfileService : IProfileService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileStorageService _fileStorage;

        public ProfileService(
            ApplicationDbContext context,
            IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        public async Task<UploadResult> UploadProfilePhotoAsync(string userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return new UploadResult { Success = false, Error = "Fichier invalide" };

            if (file.Length > 2 * 1024 * 1024)
                return new UploadResult { Success = false, Error = "Fichier trop volumineux (max 2MB)" };

            // ✅ conversion sécurisée
            if (!int.TryParse(userId, out var parsedId))
                return new UploadResult { Success = false, Error = "ID utilisateur invalide" };

            var user = await _context.Users.FindAsync(parsedId);

            if (user == null)
                return new UploadResult { Success = false, Error = "Utilisateur introuvable" };

            // Supprimer ancienne photo
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                _fileStorage.DeleteFile(user.ProfileImageUrl);

            var imageUrl = await _fileStorage.SaveFileAsync(file);

            user.ProfileImageUrl = imageUrl;
            await _context.SaveChangesAsync();

            return new UploadResult
            {
                Success = true,
                ImageUrl = imageUrl
            };
        }

        public async Task ChangePassword(string userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(int.Parse(userId));

            if (user == null)
                throw new Exception("Utilisateur introuvable");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new Exception("Les mots de passe ne correspondent pas");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                throw new Exception("Mot de passe actuel incorrect");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _context.SaveChangesAsync();
        }

        public async Task<PublicProfileDto> GetPublicProfile(string id)
        {
            var user = await _context.Users
    .FirstOrDefaultAsync(u => u.Id == int.Parse(id));

            if (user == null || !user.IsPublic)
                throw new Exception("Profil privé");

            var totalTrips = await _context.Trips
                .CountAsync(t => t.DriverId == id && t.Status == "COMPLETED");

            var rating = await _context.Reviews
                .Where(r => r.UserId == id)
                .AverageAsync(r => (double?)r.Rating) ?? 0;

            return user.ToPublicProfile(totalTrips, rating);
        }
    }
}
