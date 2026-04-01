// Features/goboard/Services/GoboardService.cs

using Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.goboard.Services
{
    public interface IGoboardService
    {
        double ComputeGaugePercent(int score, int maxScore);
        (string Emoji, string Label) ComputeRankDisplay(int rank);
        string ComputeLevelLabel(int score, int maxScore);
        int ComputePotentialPoints(IEnumerable<GoTaskDisplayModel> tasks);
    }

    public class GoboardService : IGoboardService
    {
        public double ComputeGaugePercent(int score, int maxScore)
            => maxScore <= 0 ? 0 : Math.Clamp((double)score / maxScore, 0.0, 1.0);

        public (string Emoji, string Label) ComputeRankDisplay(int rank) => rank switch
        {
            1 => ("🥇", $"#{rank} ce mois"),
            2 => ("🥈", $"#{rank} ce mois"),
            3 => ("🥉", $"#{rank} ce mois"),
            _ => ("",   $"#{rank} ce mois"),
        };

        public string ComputeLevelLabel(int score, int maxScore)
        {
            var pct = ComputeGaugePercent(score, maxScore);
            return pct switch
            {
                < 0.25 => "Débutant",
                < 0.50 => "Intermédiaire",
                < 0.75 => "Avancé",
                _      => "Expert",
            };
        }

        public int ComputePotentialPoints(IEnumerable<GoTaskDisplayModel> tasks)
            => tasks.Where(t => t.Status == GoTaskStatus.Todo).Sum(t => t.Points);
    }
}
