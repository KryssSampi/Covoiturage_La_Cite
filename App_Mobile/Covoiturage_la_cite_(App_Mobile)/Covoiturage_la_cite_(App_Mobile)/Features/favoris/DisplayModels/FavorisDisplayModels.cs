// ============================================================
//  Features/favoris/DisplayModels/FavorisDisplayModels.cs
//  Modèles d'affichage pour la page des favoris.
//  Trois types : Lieu, Personne, Alerte.
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Features.favoris.DisplayModels
{
    public enum FavoriteType { Place, Person, Alert }

    /// <summary>
    /// Carte unifiée pour les 3 types de favoris.
    /// Les champs spécifiques à un type sont null pour les autres types.
    /// </summary>
    public record FavoriteCardDisplayModel(
        string       Id,
        FavoriteType Type,

        // ── Commun ──────────────────────────────
        string Name,
        string Emoji,
        string SubLabel,

        // ── Lieu ────────────────────────────────
        string? PlaceAddress,
        string? PlaceEstimatedTime,   // ex. "12 min"

        // ── Personne ────────────────────────────
        string PersonInitial,
        string PersonRoleLabel,       // "Conducteur" | "Passager"
        string PersonLastTripStr,     // "il y a 3 jours"
        bool   PersonIsDriver,

        // ── Alerte ──────────────────────────────
        string AlertOrigin,
        string AlertDestination,
        bool   AlertIsActive,
        string AlertFrequency         // "Tous les jours", "Lun–Ven", …
    );
}
