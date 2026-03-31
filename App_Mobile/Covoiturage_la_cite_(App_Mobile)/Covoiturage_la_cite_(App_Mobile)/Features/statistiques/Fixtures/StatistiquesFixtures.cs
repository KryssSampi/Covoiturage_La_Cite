using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.statistiques.Fixtures
{
    public static class StatistiquesFixtures
    {
        public static KpiGridDisplayModel KpiGrid() => new(new[]
        {
            new KpiCardDisplayModel("DirectionsCar", "#FDECEA", "#E24B4A", "21",  "",  "Trajets complétés", "↑ +8 vs mois préc.",  true),
            new KpiCardDisplayModel("Eco",          "#E1F5EE", "#0F6E56", "49.7","kg","CO2 économisé",   "↑ +12.3 kg",        true),
            new KpiCardDisplayModel("AttachMoney",  "#E8F0FE", "#1A56CC", "40.8","$","Revenus ce mois", "↑ +100% vs préc.",  true),
            new KpiCardDisplayModel("Star",         "#FAEEDA", "#F59E0B", "4.5", "",  "Note moyenne",   "↑ Médiane 4.7★",     true),
        });

        public static EvaluationSectionDisplayModel Evaluations() => new(
            AverageRating: 4.5,
            TotalReviews: 21,
            RatingBars: new[]
            {
                new RatingBarDisplayModel(5, 0.52, 11),
                new RatingBarDisplayModel(4, 0.48, 10),
                new RatingBarDisplayModel(3, 0.00, 0),
                new RatingBarDisplayModel(2, 0.00, 0),
                new RatingBarDisplayModel(1, 0.00, 0),
            },
            WeeklyBars: new[]
            {
                new WeeklyActivityBarDisplayModel("S18", "10.2", 1.00, false),
                new WeeklyActivityBarDisplayModel("S16", "10.2", 1.00, false),
                new WeeklyActivityBarDisplayModel("S14", "10.2", 1.00, false),
                new WeeklyActivityBarDisplayModel("S13", "—",    0.10, true),
                new WeeklyActivityBarDisplayModel("S12", "10.2", 1.00, false),
            },
            InsightText: "Vos notes sont excellentes avec une médiane à 4.7★ sur 4 des 5 dernières semaines."
        );

        public static RecentTripsDisplayModel RecentTrips() => new(
            Trips: new[]
            {
                new RecentTripDisplayModel("Barrhaven → Campus La Cité", "2026-05-04 · 17:25 · 2 pass. · 23.5 km", "0,00 $", "▼ 9.9 kg CO2", 4),
                new RecentTripDisplayModel("Campus → Orléans Park and Ride", "2026-05-03 · 08:15 · 1 pass. · 16.1 km", "0,00 $", "▼ 6.8 kg CO2", 4),
                new RecentTripDisplayModel("Gatineau C.-V. → ByWard Market", "2026-05-02 · 16:50 · 1 pass. · 8 km", "0,00 $", "▼ 2.5 kg CO2", 3),
            },
            FooterLabel: "5 trajets réussis sur 5 récents →"
        );

        public static BadgeGridDisplayModel Badges() => new(
            Badges: new[]
            {
                new BadgeDisplayModel("🎓", "Étudiant Cité", "Jan. 2026", "", false),
                new BadgeDisplayModel("✅", "Confirmé", "Fév. 2026", "", false),
                new BadgeDisplayModel("🌱", "Éco-Débutant", "Juin 2026", "", false),
                new BadgeDisplayModel("⭐", "Étudiant La Cité", "Fév. 2026", "", false),
                new BadgeDisplayModel("💎", "Expert", "", "51–100 trajets · 14 restants", true),
                new BadgeDisplayModel("⏰", "Ponctuel", "", "95% ponct. · 5 pts", true),
            },
            ObtainedCount: 4,
            InsightText: "Votre prochain badge 'Expert' nécessite 14 trajets supplémentaires. Vous y êtes presque !"
        );
    }
}
