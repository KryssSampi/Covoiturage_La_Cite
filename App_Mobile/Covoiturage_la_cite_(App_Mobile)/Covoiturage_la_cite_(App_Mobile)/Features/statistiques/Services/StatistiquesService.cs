using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.statistiques.Services
{
    public interface IStatistiquesService
    {
        IReadOnlyList<WeeklyActivityBarDisplayModel> NormalizeWeeklyBars(
            IReadOnlyList<WeeklyActivityBarDisplayModel> bars);

        string BuildStarString(int rating, int maxStars = 5);

        RecentTripsDisplayModel FilterTripsByPeriod(
            RecentTripsDisplayModel all, StatPeriod period);
    }

    public class StatistiquesService : IStatistiquesService
    {
        public IReadOnlyList<WeeklyActivityBarDisplayModel> NormalizeWeeklyBars(
            IReadOnlyList<WeeklyActivityBarDisplayModel> bars)
        {
            var maxRatio = bars.Where(b => !b.IsEmpty).Max(b => b.HeightRatio);
            if (maxRatio <= 0) return bars;
            return bars.Select(b => b with
            {
                HeightRatio = b.IsEmpty ? 0.1 : b.HeightRatio / maxRatio
            }).ToList();
        }

        public string BuildStarString(int rating, int maxStars = 5)
        {
            var filled = Math.Clamp(rating, 0, maxStars);
            return new string('★', filled) + new string('☆', maxStars - filled);
        }

        public RecentTripsDisplayModel FilterTripsByPeriod(
            RecentTripsDisplayModel all, StatPeriod period)
        {
            return period switch
            {
                StatPeriod.SevenDays => all with { Trips = all.Trips.Take(1).ToList() },
                StatPeriod.ThreeMonths or StatPeriod.All => all,
                _ => all,
            };
        }
    }
}
