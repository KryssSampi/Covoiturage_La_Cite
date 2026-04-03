using covoiturageAPI.Models;
using covoiturageAPI.DTOs;

namespace covoiturageAPI.Profiles
{
    public static  class UserMapping
    {
        public static PublicProfileDto ToPublicProfile(this User user, int totalTrips, double rating)
        {
            return new PublicProfileDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Bio = user.Bio,
                ProfileImageUrl = user.ProfileImageUrl,
                TotalTrips = totalTrips,
                Rating = rating
            };
        }
    }
}
