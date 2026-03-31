namespace Covoiturage_la_cite__App_Mobile_.Core.Config
{
    public record HomeQuickNavItemConfig(
        string Label,
        string Route,
        string IconKey,
        string BackgroundHex,
        string ForegroundHex,
        string? BadgeText = null
    );

    public static class HomeQuickNavConfig
    {
        public static readonly IReadOnlyList<HomeQuickNavItemConfig> Items = new List<HomeQuickNavItemConfig>
        {
            new("Mes favoris", "favoris", "Favorite", "#E8F0FE", "#1A56CC"),
            new("Planificateur", "planifier", "CalendarToday", "#E1F5EE", "#0F6E56"),
            new("Statistiques", "stats", "BarChart", "#FAEEDA", "#854F0B"),
            new("Réservation", "reservation", "Event", "#E1F5EE", "#0F6E56"),
            new("Profil", "profil", "Person", "#FAEEDA", "#854F0B"),
            new("Menu", "menu", "MoreHoriz", "#E8F0FE", "#1A56CC"),
        };
    }
}
