// ============================================================
//  Features/nouveautes/DisplayModels/NouveautesDisplayModels.cs
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Features.nouveautes.DisplayModels
{
    public enum NouveauteBadge { New, Update, Fix, Tip }

    public record NouveauteCardDisplayModel(
        string          Id,
        string          Title,
        string          Description,
        string          YoutubeVideoId,   // ex: "dQw4w9WgXcQ"
        string          DateLabel,        // "1er avril 2026"
        NouveauteBadge  Badge,
        string          BadgeLabel,       // "Nouveau", "Mise à jour", …
        string          BadgeColorHex,
        string          BadgeTextHex
    );
}
