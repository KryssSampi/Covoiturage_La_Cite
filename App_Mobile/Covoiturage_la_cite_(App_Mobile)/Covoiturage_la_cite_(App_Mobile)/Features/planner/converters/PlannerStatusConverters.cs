// Features/planner/converters/PlannerStatusConverters.cs
// ════════════════════════════════════════════════════════════════════════
// Deux converters distincts (conducteur ≠ passager) pour les badges
// de statut. Couleurs fidèles au status.utils.ts web.
// ════════════════════════════════════════════════════════════════════════

using System.Globalization;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.converters;

// ─── Données couleur partagées ────────────────────────────────────────────────

file record StatusStyle(
    string BackgroundHex,
    string ForegroundHex,
    string Label
);

// ─── Conducteur ───────────────────────────────────────────────────────────────
// Source : PUBLISHED_TRIP_STATUS_COLORS (status.utils.ts)

file static class DriverStatusStyles
{
    private static readonly Dictionary<DriverTripStatusEnum, StatusStyle> Map = new()
    {
        // bg-gray-400      → #8A95A8
        [DriverTripStatusEnum.Published]  = new("#EEF0F5", "#545D6E", "Publiée"),
        // bg-yellow-400    → #D4AB1A
        [DriverTripStatusEnum.Full]       = new("#FAEEDA", "#854F0B", "Complet"),
        // bg-green-400     → teal-light / teal
        [DriverTripStatusEnum.Confirmed]  = new("#E1F5EE", "#0F6E56", "Confirmée"),
        // bg-red-400       → red-light / red
        [DriverTripStatusEnum.InProgress] = new("#FCEBEB", "#A32D2D", "En cours"),
        // bg-[#08316e]     → blue-deep
        [DriverTripStatusEnum.Completed]  = new("#E8F0FE", "#08316e", "Terminée"),
        // bg-orange-400    → amber-light / amber
        [DriverTripStatusEnum.Cancelled]  = new("#FAEEDA", "#854F0B", "Annulée"),
        // bg-gray-400
        [DriverTripStatusEnum.NoShow]     = new("#EEF0F5", "#545D6E", "Absent"),
    };

    public static StatusStyle Get(DriverTripStatusEnum s)
        => Map.TryGetValue(s, out var v) ? v : new("#EEF0F5", "#545D6E", s.ToString());
}

// ─── Passager ─────────────────────────────────────────────────────────────────
// Source : RESERVATION_STATUS_CLASSES (status.utils.ts)

file static class PassengerStatusStyles
{
    private static readonly Dictionary<PassengerReservationStatusEnum, StatusStyle> Map = new()
    {
        // bg-green-400
        [PassengerReservationStatusEnum.Confirmed]  = new("#E1F5EE", "#0F6E56", "Confirmée"),
        // bg-gray-600
        [PassengerReservationStatusEnum.Pending]    = new("#EEF0F5", "#545D6E", "En attente"),
        // bg-orange-400
        [PassengerReservationStatusEnum.Cancelled]  = new("#FAEEDA", "#854F0B", "Annulée"),
        // bg-[#08316e]
        [PassengerReservationStatusEnum.Completed]  = new("#E8F0FE", "#08316e", "Terminée"),
        // bg-red-400
        [PassengerReservationStatusEnum.InProgress] = new("#FCEBEB", "#A32D2D", "En cours"),
        // bg-yellow-500
        [PassengerReservationStatusEnum.Rejected]   = new("#FAEEDA", "#BA7517", "Rejetée"),
    };

    public static StatusStyle Get(PassengerReservationStatusEnum s)
        => Map.TryGetValue(s, out var v) ? v : new("#EEF0F5", "#545D6E", s.ToString());
}

// ─── Converter couleur de fond — Conducteur ───────────────────────────────────

/// <summary>
/// Convertit DriverTripStatusEnum → Color (fond du badge).
/// Usage XAML : Converter={StaticResource DriverStatusBgConverter}
/// </summary>
public class DriverStatusBackgroundConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is DriverTripStatusEnum s
            ? Color.FromArgb(DriverStatusStyles.Get(s).BackgroundHex)
            : Colors.Transparent;

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

/// <summary>Convertit DriverTripStatusEnum → Color (texte du badge).</summary>
public class DriverStatusForegroundConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is DriverTripStatusEnum s
            ? Color.FromArgb(DriverStatusStyles.Get(s).ForegroundHex)
            : Color.FromArgb("#545D6E");

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

/// <summary>Convertit DriverTripStatusEnum → string (libellé localisé FR).</summary>
public class DriverStatusLabelConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is DriverTripStatusEnum s ? DriverStatusStyles.Get(s).Label : "";

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

// ─── Converter couleur de fond — Passager ─────────────────────────────────────

/// <summary>Convertit PassengerReservationStatusEnum → Color (fond du badge).</summary>
public class PassengerStatusBackgroundConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is PassengerReservationStatusEnum s
            ? Color.FromArgb(PassengerStatusStyles.Get(s).BackgroundHex)
            : Colors.Transparent;

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

/// <summary>Convertit PassengerReservationStatusEnum → Color (texte du badge).</summary>
public class PassengerStatusForegroundConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is PassengerReservationStatusEnum s
            ? Color.FromArgb(PassengerStatusStyles.Get(s).ForegroundHex)
            : Color.FromArgb("#545D6E");

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

/// <summary>Convertit PassengerReservationStatusEnum → string (libellé).</summary>
public class PassengerStatusLabelConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is PassengerReservationStatusEnum s ? PassengerStatusStyles.Get(s).Label : "";

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

// ─── Converter count → couleur dot calendrier ────────────────────────────────

/// <summary>
/// Convertit un entier (nb trajets du jour) → Color selon l'échelle
/// chromatique 1=vert … 7+=rouge identique au HTML.
/// </summary>
public class TripCountToColorConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
    {
        var count = v is int i ? i : 0;
        return count == 0
            ? Colors.Transparent
            : Color.FromArgb(TripDotColors.FromCount(count));
    }

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}

/// <summary>
/// Convertit un entier > 0 → true (pour afficher ou masquer le dot).
/// </summary>
public class TripCountToBoolConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is int i && i > 0;

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}


