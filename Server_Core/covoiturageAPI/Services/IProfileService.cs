using covoiturageAPI.DTOs;
namespace covoiturageAPI.Services
{
    public interface IProfileService
    {
        Task<UploadResult> UploadProfilePhotoAsync(string userId, IFormFile file);
        Task ChangePassword(string userId, ChangePasswordDto dto);
        Task<PublicProfileDto> GetPublicProfile(string id);
    }

    public class UploadResult
    {
        public bool Success { get; set; }
        public string? ImageUrl { get; set; }
        public string? Error { get; set; }
    }
}
