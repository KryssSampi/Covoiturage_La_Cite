// Features/statistiques/DisplayModels/StatistiquesDisplayModels.cs

namespace Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayModels
{
    public enum StatPeriod { SevenDays, CurrentMonth, ThreeMonths, All }

    public record KpiCardDisplayModel(
        string MaterialIcon,
        string IconBgHex,
        string IconColorHex,
        string Value,
        string Unit,
        string Label,
        string TrendLabel,
        bool   TrendIsPositive
    );

    public record KpiGridDisplayModel(
        IReadOnlyList<KpiCardDisplayModel> Cards
    );

    public record RatingBarDisplayModel(int Stars, double FillPercent, int Count);

    public record WeeklyActivityBarDisplayModel(
        string WeekLabel,
        string ValueLabel,
        double HeightRatio,
        bool   IsEmpty
    );

    public record EvaluationSectionDisplayModel(
        double AverageRating,
        int TotalReviews,
        IReadOnlyList<RatingBarDisplayModel> RatingBars,
        IReadOnlyList<WeeklyActivityBarDisplayModel> WeeklyBars,
        string InsightText
    );

    public record RecentTripDisplayModel(
        string Route,
        string MetaLine,
        string AmountLabel,
        string Co2Label,
        int StarRating
    );

    public record RecentTripsDisplayModel(
        IReadOnlyList<RecentTripDisplayModel> Trips,
        string FooterLabel
    );

    public record BadgeDisplayModel(
        string Emoji,
        string Name,
        string DateLabel,
        string ProgressLabel,
        bool   IsLocked
    );

    public record BadgeGridDisplayModel(
        IReadOnlyList<BadgeDisplayModel> Badges,
        int ObtainedCount,
        string InsightText
    );
}
