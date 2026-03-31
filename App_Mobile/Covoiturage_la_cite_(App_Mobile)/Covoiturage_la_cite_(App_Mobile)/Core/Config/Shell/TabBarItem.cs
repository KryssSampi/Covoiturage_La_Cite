using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Core.Config.Shell
{
    public static class TabBarConfig
    {
        // ──────────────────────────────────────────────────────────────────
        //  ⚙️  LISTE DES ONGLETS — modifiez ici, de gauche à droite.
        //  Placez IsHome = true sur l'item central (index 2 sur 5).
        //  Icônes : https://fonts.google.com/icons  (noms PascalCase)
        // ──────────────────────────────────────────────────────────────────
        public static readonly IReadOnlyList<TabBarItem> Items = new List<TabBarItem>
    {
        new()
        {
            MaterialIcon = "Checklist",
            Label        = "Demande",
            Route        = "Demande",
        },
        new()
        {
            MaterialIcon = "CalendarToday",
            Label        = "planifier",
            Route        = "planifier",
        },
 
        // ── HOME (centre) ─────────────────────────────────────────────
        new()
        {
            MaterialIcon = "Home",
            Label        = "Accueil",
            Route        = "accueil",
            IsHome       = true,
        },
        // ──────────────────────────────────────────────────────────────

        new()
        {
            MaterialIcon = "Chat",
            Label        = "Messages",
            Route        = "messages",
        },
        new()
        {
            MaterialIcon = "Person",
            Label        = "Profil",
            Route        = "profil",
        },
    };

        // ── Couleurs ── (modifiable sans toucher au XAML)
        public const string ActiveCardBackground = "#08316e";   // carte item sélectionné
        public const string ActiveCardForeground = "#FFFFFF";   // icône + texte sélectionné
        public const string InactiveColor = "#8A95A8";   // icône + texte non sélectionné
        public const string TabBarBackground = "#FFFFFF";   // fond de la barre
        public const string TabBarBorderTop = "#120000"; // ligne du haut

        // ── Dimensions ──
        public const double TabBarHeight = 68;   // hauteur totale barre
        public const double HomeButtonSize = 54;   // taille du bouton Home (carré arrondi)
        public const double HomeButtonRadius = 16;   // border radius du bouton Home
        public const double RegularIconSize = 24;   // taille icône items normaux
        public const double HomeIconSize = 32;   // taille icône Home
        public const double LabelFontSize = 10;   // taille texte label
    }
}
