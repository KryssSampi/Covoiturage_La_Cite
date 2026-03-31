using MauiIcons.Core;

namespace Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels
{
    // ─────────────────────────────────────────────────────────────
    //  Modèle d'un item de navigation dans le SideNav
    // ─────────────────────────────────────────────────────────────
    public class SideNavItem
    {
        /// <summary>  Fonction de création de l'icône</summary>
        public  View IconFactory { get; init; } = null!;
        /// <summary>Libellé affiché</summary>
        public string Label { get; init; } = "";

        /// <summary>Route Shell (ex: "accueil", "trajets", "trajet_detail")</summary>
        public string Route { get; init; } = "";

        /// <summary>Couleur de l'icône (optionnel - null = couleur thème)</summary>
        public string? IconColor { get; init; }
    }

    // ─────────────────────────────────────────────────────────────
    //  Modèle d'un item footer (Settings / À propos / Déconnexion)
    // ─────────────────────────────────────────────────────────────
    public class SideNavFooterItem
    {
        public View IconFactory { get; init; } = null!;
        public string Label { get; init; } = "";
        public string? Route { get; init; }       // null si action
        public string? ActionKey { get; init; }   // "logout", etc.
        public string? IconColor { get; init; }
    }

}
