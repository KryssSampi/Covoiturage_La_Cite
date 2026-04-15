// ============================================================
//  Features/brouillons/DisplayModels/BrouillonsDisplayModels.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayModels
{
    public record BrouillonCardDisplayModel(
        string            Id,
        RouteDisplayModel Route,
        string            ScheduleLabel,      // "Mar. 15 avr. · 08h30" ou "Date non définie"
        string            ModifiedLabel,      // "Modifié il y a 2 jours"
        int               CompletionPercent,  // 0–100
        string            CompletionLabel,    // "3 champs manquants" ou "Complet"
        bool              IsComplete
    );
}
