// Features/planner/DisplayModels/PlannerDisplayModels.cs
// ════════════════════════════════════════════════════════════════════════
// Tous les types d'affichage de la feature Planner.
// La vue ne connaît que ces records — jamais les entités domain.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;

// ─── Enum rôle utilisateur ────────────────────────────────────────────────────
// Seul enum que le controller reçoit de l'extérieur.

public enum UserRole { Driver, Passenger }

// ─── Statuts (miroir du status.utils.ts) ─────────────────────────────────────

public enum DriverTripStatusEnum
{
    Published,   // Publiée
    Full,        // Complet
    Confirmed,   // Confirmée
    InProgress,  // En cours
    Completed,   // Terminée
    Cancelled,   // Annulée
    NoShow,      // Absent
}

public enum PassengerReservationStatusEnum
{
    Confirmed,   // Confirmée
    Pending,     // En attente
    Cancelled,   // Annulée
    Completed,   // Terminée
    InProgress,  // En cours
    Rejected,    // Rejetée
}

// ─── Cellule du calendrier ────────────────────────────────────────────────────

public record CalendarCellDisplayModel(
    DateTime Date,
    bool     IsToday,
    bool     IsActive,       // date sélectionnée
    bool     IsUnavailable,  // jour marqué indisponible
    bool     IsWeekend,
    bool     IsOtherMonth,   // jour d'un mois adjacent (grisé)
    int      TripCount       // 0 = pas de dot
);

// ─── Mois du calendrier ───────────────────────────────────────────────────────

public record CalendarMonthDisplayModel(
    int                               Year,
    int                               Month,
    string                            MonthLabel,   // "Mars 2026"
    IReadOnlyList<CalendarCellDisplayModel> Cells   // toujours 35 ou 42 cellules
);

// ─── Légende calendrier ───────────────────────────────────────────────────────

public record CalendarLegendDisplayModel(
    string MinColorHex,  // "#2D9D6A"
    string MaxColorHex,  // "#E24B4A"
    string MinLabel,     // "1"
    string MaxLabel,     // "7+"
    string UnavailLabel  // "indisponible"
);

// ─── Dot de trajet par jour ───────────────────────────────────────────────────

// Scale couleur des dots (1→vert, 7+→rouge) — identique au HTML
public static class TripDotColors
{
    public static string FromCount(int count) => count switch
    {
        1   => "#2D9D6A",
        2   => "#3BAA5A",
        3   => "#70BB40",
        4   => "#A8C030",
        5   => "#D4AB1A",
        6   => "#E07B18",
        >= 7 => "#E24B4A",
        _   => "Transparent",
    };
}

// ─── Pills de statut du jour ──────────────────────────────────────────────────

public record StatusPillDisplayModel(
    string BackgroundHex,
    string ForegroundHex,
    string IconGlyph,
    string Label,
    int    Count
);

public record DayStatusBarDisplayModel(
    IReadOnlyList<StatusPillDisplayModel> Pills,
    bool                                  IsViewAll  // mode "voir tout" actif
);

// ─── Section Rides (liste du jour ou vue totale) ─────────────────────────────

public record RidesDayHeaderDisplayModel(
    string DateLabel,   // "Vendredi 27 mars 2026"
    bool   CanGoBack,
    bool   CanGoForward
);

// Wrappeur discriminant pour passer l'une ou l'autre carte dans la liste
public abstract record PlannerRideItem;

public record DriverRideItem(
    DriverTripCardDisplayModel Card,
    DriverTripStatusEnum       Status,
    DateTime                   Date
) : PlannerRideItem;

public record PassengerRideItem(
    PassengerReservationCardDisplayModel Card,
    PassengerReservationStatusEnum       Status,
    DateTime                             Date
) : PlannerRideItem;

// Section complète affichée sous le calendrier
public record PlannerRidesSectionDisplayModel(
    RidesDayHeaderDisplayModel        Header,
    DayStatusBarDisplayModel          StatusBar,
    IReadOnlyList<PlannerRideItem>    Items,    // filtrés/triés par le controller
    bool                              IsViewAll,
    bool                              ShowEmpty
);

// ─── Indisponibilités ─────────────────────────────────────────────────────────

public record UnavailabilityDisplayModel(
    string   Id,            // GUID local (UI) — sera l'ID API
    string   Title,         // "Lundi & Jeudi · 08:00 – 12:00"
    string   Detail,        // "Récurrent · Toutes les semaines"
    bool     IsRecurrent,
    DateTime? SpecificDate, // null si récurrent
    TimeSpan  StartTime,
    TimeSpan  EndTime,
    IReadOnlyList<DayOfWeek> RecurringDays
);

// ─── Sheet d'ajout d'indisponibilité ─────────────────────────────────────────

public record UnavailabilityFormDisplayModel(
    DateTime? SelectedDate,
    TimeSpan  StartTime,
    TimeSpan  EndTime,
    bool      IsRecurrent,
    bool      RecurrentEnabled,    // désactivé si date spécifique choisie
    IReadOnlyList<DayOfWeek> SelectedDays,
    IReadOnlyList<UnavailabilityDisplayModel> ExistingItems,
    bool      IsSaving
);

// ─── Actions rapides du header ────────────────────────────────────────────────

public record PlannerHeaderActionsDisplayModel(
    string FindTripLabel,
    string AvailabilityLabel,
    string FindTripIconGlyph,
    string AvailabilityIconGlyph
);

// ─── Page complète ────────────────────────────────────────────────────────────

public record PlannerPageDisplayModel(
    CalendarMonthDisplayModel         Calendar,
    PlannerRidesSectionDisplayModel   RidesSection,
    PlannerHeaderActionsDisplayModel  HeaderActions,
    UnavailabilityFormDisplayModel?   Sheet,       // null = sheet fermée
    bool                              IsLoading,
    UserRole                          Role
);
