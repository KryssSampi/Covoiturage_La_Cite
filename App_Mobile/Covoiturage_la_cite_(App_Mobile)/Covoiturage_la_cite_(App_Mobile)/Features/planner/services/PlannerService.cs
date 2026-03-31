// Features/planner/services/PlannerService.cs
// ════════════════════════════════════════════════════════════════════════
// Algorithmes métier de la feature Planner.
// Le DisplayController appelle ces méthodes — aucune logique ici sur l'UI.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.Services;

public interface IPlannerService
{
    // ── Calendrier ──────────────────────────────────────────────────────

    /// <summary>Construit les cellules du mois (35 ou 42 cases, Lundi=1er col).</summary>
    IReadOnlyList<CalendarCellDisplayModel> BuildMonthCells(
        int year, int month,
        DateTime activeDate,
        IReadOnlyList<DateTime> unavailableDates,
        Func<DateTime, int> tripCountForDay);

    /// <summary>Libellé localisé du mois en français.</summary>
    string GetMonthLabel(int year, int month);

    // ── Statuts du jour ─────────────────────────────────────────────────

    /// <summary>Construit les pills de statut pour le résumé du jour (conducteur).</summary>
    IReadOnlyList<StatusPillDisplayModel> BuildDriverDayPills(
        IEnumerable<PlannerRideItem> items);

    /// <summary>Construit les pills de statut pour le résumé du jour (passager).</summary>
    IReadOnlyList<StatusPillDisplayModel> BuildPassengerDayPills(
        IEnumerable<PlannerRideItem> items);

    // ── Filtrage / Tri ───────────────────────────────────────────────────

    /// <summary>Filtre les items selon la date active (mode jour) ou tous (vue totale).</summary>
    IReadOnlyList<PlannerRideItem> FilterByDate(
        IReadOnlyList<PlannerRideItem> all,
        DateTime? activeDate);

    /// <summary>Filtre plein-texte sur les propriétés string des items.</summary>
    IReadOnlyList<PlannerRideItem> FilterBySearch(
        IReadOnlyList<PlannerRideItem> items,
        string query);

    /// <summary>Applique les filtres actifs (statut, etc.).</summary>
    IReadOnlyList<PlannerRideItem> ApplyFilters(
        IReadOnlyList<PlannerRideItem> items,
        PlannerFilterState filters);

    /// <summary>Trie les items selon l'option sélectionnée.</summary>
    IReadOnlyList<PlannerRideItem> ApplySort(
        IReadOnlyList<PlannerRideItem> items,
        PlannerSortOption sort);

    // ── Indisponibilités ────────────────────────────────────────────────

    /// <summary>
    /// Valide et construit un UnavailabilityDisplayModel depuis le formulaire.
    /// Retourne null si le formulaire est invalide.
    /// </summary>
    (UnavailabilityDisplayModel? Result, string? ErrorMessage) BuildUnavailability(
        UnavailabilityFormDisplayModel form);

    /// <summary>
    /// Vérifie si un jour est marqué indisponible
    /// (date spécifique OU récurrence couvrant ce jour).
    /// </summary>
    bool IsDateUnavailable(
        DateTime date,
        IReadOnlyList<UnavailabilityDisplayModel> unavailabilities);
}

// ─── Options filtre / tri exposées au controller ──────────────────────────────

public class PlannerFilterState
{
    public HashSet<DriverTripStatusEnum>          ActiveDriverStatuses    { get; set; } = new();
    public HashSet<PassengerReservationStatusEnum> ActivePassengerStatuses { get; set; } = new();
}

public enum PlannerSortOption
{
    DateAsc,     // Plus tôt en premier (défaut)
    DateDesc,    // Plus tard en premier
    PriceAsc,    // Prix croissant
    PriceDesc,   // Prix décroissant
}

// ─── Implémentation ───────────────────────────────────────────────────────────

public class PlannerService : IPlannerService
{
    private static readonly string[] FrMonths =
        ["Janvier","Février","Mars","Avril","Mai","Juin",
         "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

    // ── Calendrier ──────────────────────────────────────────────────────

    public IReadOnlyList<CalendarCellDisplayModel> BuildMonthCells(
        int year, int month,
        DateTime activeDate,
        IReadOnlyList<DateTime> unavailableDates,
        Func<DateTime, int> tripCountForDay)
    {
        var cells = new List<CalendarCellDisplayModel>();
        var firstOfMonth = new DateTime(year, month, 1);
        var today = DateTime.Today;

        // Lundi = 1er colonne (0-indexed Mon=0)
        int startOffset = ((int)firstOfMonth.DayOfWeek + 6) % 7;
        int daysInMonth = DateTime.DaysInMonth(year, month);
        int daysInPrevMonth = DateTime.DaysInMonth(
            month == 1 ? year - 1 : year,
            month == 1 ? 12 : month - 1);

        // Jours du mois précédent
        for (int i = startOffset - 1; i >= 0; i--)
        {
            var d = new DateTime(
                month == 1 ? year - 1 : year,
                month == 1 ? 12 : month - 1,
                daysInPrevMonth - i);
            cells.Add(MakeCell(d, today, activeDate, unavailableDates, tripCountForDay,
                isOtherMonth: true));
        }

        // Jours du mois courant
        for (int day = 1; day <= daysInMonth; day++)
        {
            var d = new DateTime(year, month, day);
            cells.Add(MakeCell(d, today, activeDate, unavailableDates, tripCountForDay,
                isOtherMonth: false));
        }

        // Compléter jusqu'à 35 ou 42 cases
        int total = cells.Count <= 35 ? 35 : 42;
        int nextDay = 1;
        while (cells.Count < total)
        {
            var d = new DateTime(
                month == 12 ? year + 1 : year,
                month == 12 ? 1 : month + 1,
                nextDay++);
            cells.Add(MakeCell(d, today, activeDate, unavailableDates, tripCountForDay,
                isOtherMonth: true));
        }

        return cells;
    }

    private static CalendarCellDisplayModel MakeCell(
        DateTime date, DateTime today, DateTime activeDate,
        IReadOnlyList<DateTime> unavailableDates,
        Func<DateTime, int> tripCountForDay,
        bool isOtherMonth)
    {
        bool isUnavail = unavailableDates.Any(u => u.Date == date.Date);
        return new CalendarCellDisplayModel(
            Date:          date,
            IsToday:       date.Date == today,
            IsActive:      date.Date == activeDate.Date,
            IsUnavailable: isUnavail,
            IsWeekend:     date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday,
            IsOtherMonth:  isOtherMonth,
            TripCount:     isOtherMonth ? 0 : tripCountForDay(date)
        );
    }

    public string GetMonthLabel(int year, int month)
        => $"{FrMonths[month - 1]} {year}";

    // ── Statuts du jour ─────────────────────────────────────────────────

    public IReadOnlyList<StatusPillDisplayModel> BuildDriverDayPills(
        IEnumerable<PlannerRideItem> items)
    {
        var pills = new List<StatusPillDisplayModel>();
        var drivers = items.OfType<DriverRideItem>().ToList();

        AddDriverPill(pills, drivers, DriverTripStatusEnum.Confirmed,
            "#E1F5EE", "#0F6E56", "\uF297");
        AddDriverPill(pills, drivers, DriverTripStatusEnum.Published,
            "#EEF0F5", "#545D6E", "\uF3BE");
        AddDriverPill(pills, drivers, DriverTripStatusEnum.InProgress,
            "#FCEBEB", "#A32D2D", "\uF14A");

        return pills;
    }

    private static void AddDriverPill(
        List<StatusPillDisplayModel> pills,
        IReadOnlyList<DriverRideItem> items,
        DriverTripStatusEnum status,
        string bg, string fg, string icon)
    {
        int count = items.Count(i => i.Status == status);
        if (count > 0)
            pills.Add(new(bg, fg, icon, TripDotColors.FromCount(count), count));
    }

    public IReadOnlyList<StatusPillDisplayModel> BuildPassengerDayPills(
        IEnumerable<PlannerRideItem> items)
    {
        var pills = new List<StatusPillDisplayModel>();
        var passengers = items.OfType<PassengerRideItem>().ToList();

        AddPassengerPill(pills, passengers, PassengerReservationStatusEnum.Confirmed,
            "#E1F5EE", "#0F6E56", "\uF297");
        AddPassengerPill(pills, passengers, PassengerReservationStatusEnum.Pending,
            "#FAEEDA", "#854F0B", "\uF150");
        AddPassengerPill(pills, passengers, PassengerReservationStatusEnum.InProgress,
            "#FCEBEB", "#A32D2D", "\uF14A");

        return pills;
    }

    private static void AddPassengerPill(
        List<StatusPillDisplayModel> pills,
        IReadOnlyList<PassengerRideItem> items,
        PassengerReservationStatusEnum status,
        string bg, string fg, string icon)
    {
        int count = items.Count(i => i.Status == status);
        if (count > 0)
            pills.Add(new(bg, fg, icon, "", count));
    }

    // ── Filtrage ─────────────────────────────────────────────────────────

    public IReadOnlyList<PlannerRideItem> FilterByDate(
        IReadOnlyList<PlannerRideItem> all,
        DateTime? activeDate)
    {
        if (activeDate == null) return all;
        return all.Where(i => i switch
        {
            DriverRideItem    d => d.Date.Date == activeDate.Value.Date,
            PassengerRideItem p => p.Date.Date == activeDate.Value.Date,
            _                   => false,
        }).ToList();
    }

    public IReadOnlyList<PlannerRideItem> FilterBySearch(
        IReadOnlyList<PlannerRideItem> items,
        string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return items;
        var q = query.Trim().ToLowerInvariant();

        return items.Where(item => item switch
        {
            DriverRideItem d => new[]
            {
                d.Card.Route.FromLabel, d.Card.Route.ToLabel,
                d.Card.TimeLabel, d.Card.PassengerLabel,
            }.Any(s => s?.Contains(q, StringComparison.OrdinalIgnoreCase) == true),

            PassengerRideItem p => new[]
            {
                p.Card.DriverName, p.Card.Route.FromLabel, p.Card.Route.ToLabel,
                p.Card.TimeLabel, p.Card.VehicleLabel,
            }.Any(s => s?.Contains(q, StringComparison.OrdinalIgnoreCase) == true),

            _ => false,
        }).ToList();
    }

    public IReadOnlyList<PlannerRideItem> ApplyFilters(
        IReadOnlyList<PlannerRideItem> items,
        PlannerFilterState filters)
    {
        return items.Where(item => item switch
        {
            DriverRideItem d =>
                filters.ActiveDriverStatuses.Count == 0 ||
                filters.ActiveDriverStatuses.Contains(d.Status),

            PassengerRideItem p =>
                filters.ActivePassengerStatuses.Count == 0 ||
                filters.ActivePassengerStatuses.Contains(p.Status),

            _ => true,
        }).ToList();
    }

    public IReadOnlyList<PlannerRideItem> ApplySort(
        IReadOnlyList<PlannerRideItem> items,
        PlannerSortOption sort)
    {
        DateTime GetDate(PlannerRideItem i) => i switch
        {
            DriverRideItem d    => d.Date,
            PassengerRideItem p => p.Date,
            _                   => DateTime.MaxValue,
        };
        decimal GetPrice(PlannerRideItem i) => i switch
        {
            DriverRideItem d    => d.Card.Price,
            PassengerRideItem p => p.Card.Price,
            _                   => 0,
        };

        return sort switch
        {
            PlannerSortOption.DateDesc  => items.OrderByDescending(GetDate).ToList(),
            PlannerSortOption.PriceAsc  => items.OrderBy(GetPrice).ToList(),
            PlannerSortOption.PriceDesc => items.OrderByDescending(GetPrice).ToList(),
            _                           => items.OrderBy(GetDate).ToList(),
        };
    }

    // ── Indisponibilités ────────────────────────────────────────────────

    public (UnavailabilityDisplayModel? Result, string? ErrorMessage) BuildUnavailability(
        UnavailabilityFormDisplayModel form)
    {
        if (form.StartTime >= form.EndTime)
            return (null, "L'heure de fin doit être après l'heure de début.");

        if (!form.IsRecurrent && form.SelectedDate == null)
            return (null, "Veuillez sélectionner une date ou activer la récurrence.");

        if (form.IsRecurrent && form.SelectedDays.Count == 0)
            return (null, "Veuillez sélectionner au moins un jour de récurrence.");

        string title = BuildUnavailTitle(form);
        string detail = form.IsRecurrent
            ? $"Récurrent · {string.Join(", ", form.SelectedDays.Select(DayFr))}"
            : "Journée spécifique";

        return (new UnavailabilityDisplayModel(
            Id:            Guid.NewGuid().ToString(),
            Title:         title,
            Detail:        detail,
            IsRecurrent:   form.IsRecurrent,
            SpecificDate:  form.IsRecurrent ? null : form.SelectedDate,
            StartTime:     form.StartTime,
            EndTime:       form.EndTime,
            RecurringDays: form.SelectedDays
        ), null);
    }

    private static string BuildUnavailTitle(UnavailabilityFormDisplayModel form)
    {
        string time = $"{form.StartTime:hh\\:mm} – {form.EndTime:hh\\:mm}";
        if (form.IsRecurrent)
        {
            string days = string.Join(" & ", form.SelectedDays.Select(DayFr));
            return $"{days} · {time}";
        }
        var d = form.SelectedDate!.Value;
        return $"{d:dd MMMM yyyy} · {time}";
    }

    public bool IsDateUnavailable(
        DateTime date,
        IReadOnlyList<UnavailabilityDisplayModel> unavailabilities)
    {
        return unavailabilities.Any(u =>
            (u.SpecificDate.HasValue && u.SpecificDate.Value.Date == date.Date) ||
            (u.IsRecurrent && u.RecurringDays.Contains(date.DayOfWeek)));
    }

    private static string DayFr(DayOfWeek d) => d switch
    {
        DayOfWeek.Monday    => "Lun",
        DayOfWeek.Tuesday   => "Mar",
        DayOfWeek.Wednesday => "Mer",
        DayOfWeek.Thursday  => "Jeu",
        DayOfWeek.Friday    => "Ven",
        DayOfWeek.Saturday  => "Sam",
        DayOfWeek.Sunday    => "Dim",
        _                   => ""
    };
}

