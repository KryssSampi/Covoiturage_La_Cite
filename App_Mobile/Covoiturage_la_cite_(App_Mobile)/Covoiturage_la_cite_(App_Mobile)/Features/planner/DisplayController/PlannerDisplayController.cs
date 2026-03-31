// Features/planner/DisplayController/PlannerDisplayController.cs
// ════════════════════════════════════════════════════════════════════════
// Contrôleur de la feature Planner.
// Gère : calendrier, navigation, mode vue, filtres, tri, recherche,
//        CRUD indisponibilités avec impact visuel immédiat.
// Ne connaît pas quel rôle est actif — reçoit les DisplayModels.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.planner.Services;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;

public partial class PlannerDisplayController : INotifyPropertyChanged
{
    private readonly IPlannerService _service;

    // ══════════════════════════════════════════════════════════════════
    // État interne
    // ══════════════════════════════════════════════════════════════════

    // Rôle
    private UserRole _role = UserRole.Driver;

    // Calendrier
    private int _year = DateTime.Today.Year;
    private int _month = DateTime.Today.Month;
    private DateTime _activeDate = DateTime.Today;

    // Données source (brutes, non filtrées)
    private IReadOnlyList<PlannerRideItem> _allItems = Array.Empty<PlannerRideItem>();
    private List<UnavailabilityDisplayModel> _unavailabilities = new();

    // Mode vue
    private bool _isViewAll = false;
    private string _searchQuery = "";

    // Filtres et tri
    private readonly PlannerFilterState _filterState = new();
    private PlannerSortOption _sortOption = PlannerSortOption.DateAsc;

    // Sheet état
    private bool _isSheetOpen = false;
    private UnavailabilityFormDisplayModel? _sheetForm = null;

    private bool _isLoading = true;

    // ══════════════════════════════════════════════════════════════════
    // Propriétés observables
    // ══════════════════════════════════════════════════════════════════

    public bool IsLoading { get => _isLoading; private set => Set(ref _isLoading, value); }

    // ── Calendrier ──────────────────────────────────────────────────

    public CalendarMonthDisplayModel Calendar { get; private set; } = default!;

    public string MonthLabel => _service.GetMonthLabel(_year, _month);
    public bool CanGoBack => new DateTime(_year, _month, 1) > DateTime.Today.AddMonths(-6);
    public bool CanGoForward => new DateTime(_year, _month, 1) < DateTime.Today.AddMonths(12);

    // ── Section rides ───────────────────────────────────────────────

    // Items affichés (après filtres + tri + mode) — List assignée en bloc = 1 seul re-render
    private IReadOnlyList<PlannerRideItem> _displayedItems = Array.Empty<PlannerRideItem>();
    public IReadOnlyList<PlannerRideItem> DisplayedItems
    {
        get => _displayedItems;
        private set => Set(ref _displayedItems, value);
    }

    // Chips des filtres actifs
    private IReadOnlyList<PlannerActiveChip> _activeFilterChips = Array.Empty<PlannerActiveChip>();
    public IReadOnlyList<PlannerActiveChip> ActiveFilterChips
    {
        get => _activeFilterChips;
        private set => Set(ref _activeFilterChips, value);
    }

    public bool IsViewAll { get => _isViewAll; private set => Set(ref _isViewAll, value); }
    public string SearchQuery
    {
        get => _searchQuery;
        set { if (Set(ref _searchQuery, value)) ApplyAll(); }
    }

    public string ActiveDateLabel => _activeDate.ToString("dddd d MMMM yyyy",
        new System.Globalization.CultureInfo("fr-FR"));

    // Pills statut du jour
    private IReadOnlyList<StatusPillDisplayModel> _statusPills = Array.Empty<StatusPillDisplayModel>();
    public IReadOnlyList<StatusPillDisplayModel> StatusPills
    {
        get => _statusPills;
        private set => Set(ref _statusPills, value);
    }

    // Filtre / tri disponibles (exposés pour les menus)
    public bool HasActiveFilters => _filterState.ActiveDriverStatuses.Count > 0
                                 || _filterState.ActivePassengerStatuses.Count > 0
                                 || _sortOption != PlannerSortOption.DateAsc;

    public PlannerSortOption CurrentSort => _sortOption;

    // Sheet
    public bool IsSheetOpen { get => _isSheetOpen; private set => Set(ref _isSheetOpen, value); }
    public UnavailabilityFormDisplayModel? SheetForm
    {
        get => _sheetForm;
        private set => Set(ref _sheetForm, value);
    }

    // ══════════════════════════════════════════════════════════════════
    // Commandes
    // ══════════════════════════════════════════════════════════════════

    // Calendrier
    public ICommand PreviousMonthCommand { get; }
    public ICommand NextMonthCommand { get; }
    public ICommand SelectDateCommand { get; }   // param: DateTime

    // Mode vue
    public ICommand ToggleViewAllCommand { get; }
    public ICommand NavigateDayCommand { get; }   // param: +1 ou -1

    // Filtres / Tri
    public ICommand ToggleDriverStatusFilterCommand { get; }  // param: DriverTripStatusEnum
    public ICommand TogglePassengerStatusFilterCommand { get; }  // param: PassengerReservationStatusEnum
    public ICommand SetSortCommand { get; }  // param: PlannerSortOption
    public ICommand RemoveChipCommand { get; }  // param: PlannerActiveChip
    public ICommand ClearFiltersCommand { get; }

    // Sheet indisponibilités
    public ICommand OpenSheetCommand { get; }
    public ICommand CloseSheetCommand { get; }
    public ICommand SetSheetDateCommand { get; }   // param: DateTime?
    public ICommand SetSheetStartTimeCommand { get; }   // param: TimeSpan
    public ICommand SetSheetEndTimeCommand { get; }   // param: TimeSpan
    public ICommand ToggleRecurrentCommand { get; }
    public ICommand ToggleDayCommand { get; }   // param: DayOfWeek
    public ICommand ConfirmUnavailabilityCommand { get; }
    public ICommand DeleteUnavailabilityCommand { get; } // param: string (Id)

    // Chargement
    public ICommand LoadCommand { get; }
    public ICommand RefreshCommand { get; }

    // ══════════════════════════════════════════════════════════════════
    // Constructeur
    // ══════════════════════════════════════════════════════════════════

    public PlannerDisplayController(IPlannerService service)
    {
        _service = service;

        // ── Calendrier ──────────────────────────────────────────────

        PreviousMonthCommand = new Command(() =>
        {
            if (!CanGoBack) return;
            if (--_month < 1) { _month = 12; _year--; }
            RebuildCalendar();
        });

        NextMonthCommand = new Command(() =>
        {
            if (!CanGoForward) return;
            if (++_month > 12) { _month = 1; _year++; }
            RebuildCalendar();
        });

        SelectDateCommand = new Command<DateTime>(date =>
        {
            _activeDate = date;
            _isViewAll = false;
            RebuildCalendar();
            ApplyAll();
            OnPropertyChanged(nameof(ActiveDateLabel));
        });

        // ── Mode vue ────────────────────────────────────────────────

        ToggleViewAllCommand = new Command(() =>
        {
            IsViewAll = !IsViewAll;
            ApplyAll();
        });

        NavigateDayCommand = new Command<int>(delta =>
        {
            _activeDate = _activeDate.AddDays(delta);
            // Synchronise le mois si nécessaire
            if (_activeDate.Month != _month || _activeDate.Year != _year)
            {
                _year = _activeDate.Year;
                _month = _activeDate.Month;
            }
            RebuildCalendar();
            ApplyAll();
            OnPropertyChanged(nameof(ActiveDateLabel));
        });

        // ── Filtres / Tri ────────────────────────────────────────────

        ToggleDriverStatusFilterCommand = new Command<DriverTripStatusEnum>(status =>
        {
            if (_filterState.ActiveDriverStatuses.Contains(status))
                _filterState.ActiveDriverStatuses.Remove(status);
            else
                _filterState.ActiveDriverStatuses.Add(status);
            ApplyAll();
        });

        TogglePassengerStatusFilterCommand = new Command<PassengerReservationStatusEnum>(status =>
        {
            if (_filterState.ActivePassengerStatuses.Contains(status))
                _filterState.ActivePassengerStatuses.Remove(status);
            else
                _filterState.ActivePassengerStatuses.Add(status);
            ApplyAll();
        });

        SetSortCommand = new Command<PlannerSortOption>(opt =>
        {
            _sortOption = opt;
            ApplyAll();
        });

        RemoveChipCommand = new Command<PlannerActiveChip>(chip =>
        {
            if (chip.IsSort)
            {
                _sortOption = PlannerSortOption.DateAsc;
            }
            else if (chip.DriverStatus.HasValue)
            {
                _filterState.ActiveDriverStatuses.Remove(chip.DriverStatus.Value);
            }
            else if (chip.PassengerStatus.HasValue)
            {
                _filterState.ActivePassengerStatuses.Remove(chip.PassengerStatus.Value);
            }
            ApplyAll();
        });

        ClearFiltersCommand = new Command(() =>
        {
            _filterState.ActiveDriverStatuses.Clear();
            _filterState.ActivePassengerStatuses.Clear();
            _sortOption = PlannerSortOption.DateAsc;
            _searchQuery = "";
            OnPropertyChanged(nameof(SearchQuery));
            ApplyAll();
        });

        // ── Sheet ────────────────────────────────────────────────────

        OpenSheetCommand = new Command(() =>
        {
            SheetForm = BuildFreshForm();
            IsSheetOpen = true;
        });

        CloseSheetCommand = new Command(() =>
        {
            IsSheetOpen = false;
            SheetForm = null;
        });

        SetSheetDateCommand = new Command<DateTime?>(date =>
        {
            if (SheetForm == null) return;
            SheetForm = SheetForm with
            {
                SelectedDate = date,
                IsRecurrent = date.HasValue ? false : SheetForm.IsRecurrent,
                RecurrentEnabled = !date.HasValue,
            };
        });

        SetSheetStartTimeCommand = new Command<TimeSpan>(t =>
        {
            if (SheetForm == null) return;
            SheetForm = SheetForm with { StartTime = t };
        });

        SetSheetEndTimeCommand = new Command<TimeSpan>(t =>
        {
            if (SheetForm == null) return;
            SheetForm = SheetForm with { EndTime = t };
        });

        ToggleRecurrentCommand = new Command(() =>
        {
            if (SheetForm == null || !SheetForm.RecurrentEnabled) return;
            SheetForm = SheetForm with
            {
                IsRecurrent = !SheetForm.IsRecurrent,
                SelectedDate = SheetForm.IsRecurrent ? null : SheetForm.SelectedDate,
            };
        });

        ToggleDayCommand = new Command<DayOfWeek>(day =>
        {
            if (SheetForm == null) return;
            var days = SheetForm.SelectedDays.ToHashSet();
            if (days.Contains(day)) days.Remove(day); else days.Add(day);
            SheetForm = SheetForm with { SelectedDays = days.ToList() };
        });

        ConfirmUnavailabilityCommand = new Command(async () =>
        {
            if (SheetForm == null) return;
            SheetForm = SheetForm with { IsSaving = true };

            var (result, error) = _service.BuildUnavailability(SheetForm);
            if (result == null)
            {
                SheetForm = SheetForm with { IsSaving = false };
                // Afficher erreur via Shell.DisplayAlert
                await Shell.Current.DisplayAlert("Erreur", error, "OK");
                return;
            }

            // ── Impact visuel immédiat ──────────────────────────────
            // 1. Ajout à la liste locale
            _unavailabilities.Add(result);

            // 2. Mise à jour du formulaire (la liste dans la sheet)
            SheetForm = SheetForm with
            {
                IsSaving = false,
                ExistingItems = _unavailabilities.ToList(),
                SelectedDate = null,
                IsRecurrent = false,
                RecurrentEnabled = true,
                SelectedDays = Array.Empty<DayOfWeek>(),
                StartTime = TimeSpan.Zero,
                EndTime = TimeSpan.Zero,
            };

            // 3. Reconstruction du calendrier (dots + cellules unavail)
            RebuildCalendar();

            // TODO : appel API
            // await _apiService.AddUnavailabilityAsync(result);
        });

        DeleteUnavailabilityCommand = new Command<string>(async id =>
        {
            var item = _unavailabilities.FirstOrDefault(u => u.Id == id);
            if (item == null) return;

            bool confirmed = await Shell.Current.DisplayAlert(
                "Supprimer",
                $"Supprimer \"{item.Title}\" ?",
                "Oui, supprimer", "Annuler");
            if (!confirmed) return;

            // ── Impact visuel immédiat ──────────────────────────────
            _unavailabilities.Remove(item);
            if (SheetForm != null)
                SheetForm = SheetForm with { ExistingItems = _unavailabilities.ToList() };
            RebuildCalendar();

            // TODO : appel API
            // await _apiService.DeleteUnavailabilityAsync(id);
        });

        // ── Chargement ──────────────────────────────────────────────

        LoadCommand = new Command(async () => await LoadAsync());
        RefreshCommand = new Command(async () => await LoadAsync());
    }

    // ══════════════════════════════════════════════════════════════════
    // API publique : injection des données depuis la feature parente
    // ══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Injecte le rôle et les items (DriverRideItem ou PassengerRideItem).
    /// Appelée par la page après chargement de l'API.
    /// </summary>
    public void SetData(UserRole role, IReadOnlyList<PlannerRideItem> items)
    {
        _role = role;
        _allItems = items;
        RebuildCalendar();
        ApplyAll();
        OnPropertyChanged(nameof(IsLoading));
    }

    // ══════════════════════════════════════════════════════════════════
    // Moteur interne
    // ══════════════════════════════════════════════════════════════════

    private async Task LoadAsync()
    {
        IsLoading = true;
        await Task.Delay(80); // simule latence réseau
        RebuildCalendar();
        ApplyAll();
        IsLoading = false;
    }

    private void RebuildCalendar()
    {
        var unavailDates = _unavailabilities
            .SelectMany(u => u.IsRecurrent
                ? Enumerable.Empty<DateTime>()          // gérées par IsDateUnavailable
                : new[] { u.SpecificDate!.Value })
            .ToList();

        // Pré-calcul O(n) des counts par jour — évite O(42 × n) dans la lambda
        var tripsByDate = _allItems
            .GroupBy(i => i switch
            {
                DriverRideItem d    => d.Date.Date,
                PassengerRideItem p => p.Date.Date,
                _                   => DateTime.MinValue,
            })
            .ToDictionary(g => g.Key, g => g.Count());

        var cells = _service.BuildMonthCells(
            _year, _month, _activeDate, unavailDates,
            date =>
            {
                if (_service.IsDateUnavailable(date, _unavailabilities)) return 0;
                return tripsByDate.TryGetValue(date.Date, out int count) ? count : 0;
            });

        Calendar = new CalendarMonthDisplayModel(
            _year, _month,
            _service.GetMonthLabel(_year, _month),
            cells);

        OnPropertyChanged(nameof(Calendar));
        OnPropertyChanged(nameof(MonthLabel));
        OnPropertyChanged(nameof(CanGoBack));
        OnPropertyChanged(nameof(CanGoForward));
    }

    private void ApplyAll()
    {
        // 1. Source : tous ou filtrés par date
        var items = IsViewAll
            ? _allItems
            : _service.FilterByDate(_allItems, _activeDate);

        // 2. Recherche plein-texte
        items = _service.FilterBySearch(items, _searchQuery);

        // 3. Filtres statut
        items = _service.ApplyFilters(items, _filterState);

        // 4. Tri
        items = _service.ApplySort(items, _sortOption);

        // Assignation en bloc → 1 seule notification PropertyChanged au lieu de N+1
        DisplayedItems = items;

        // Pills statut
        var dayItems = _service.FilterByDate(_allItems, _activeDate);
        StatusPills = _role == UserRole.Driver
            ? _service.BuildDriverDayPills(dayItems)
            : _service.BuildPassengerDayPills(dayItems);

        // Chips filtres actifs
        ActiveFilterChips = BuildChipsList();

        OnPropertyChanged(nameof(HasActiveFilters));
        OnPropertyChanged(nameof(CurrentSort));
        OnPropertyChanged(nameof(IsViewAll));
    }

    private IReadOnlyList<PlannerActiveChip> BuildChipsList()
    {
        var chips = new List<PlannerActiveChip>();

        if (_sortOption != PlannerSortOption.DateAsc)
        {
            chips.Add(new PlannerActiveChip(
                Label: _sortOption switch
                {
                    PlannerSortOption.DateDesc => "Date décroissante",
                    PlannerSortOption.PriceAsc => "Prix croissant",
                    PlannerSortOption.PriceDesc => "Prix décroissant",
                    _ => "Tri",
                },
                IsSort: true));
        }

        foreach (var s in _filterState.ActiveDriverStatuses)
            chips.Add(new PlannerActiveChip(Label: s.ToString(), DriverStatus: s));

        foreach (var s in _filterState.ActivePassengerStatuses)
            chips.Add(new PlannerActiveChip(Label: s.ToString(), PassengerStatus: s));

        return chips;
    }

    private UnavailabilityFormDisplayModel BuildFreshForm() => new(
        SelectedDate: null,
        StartTime: TimeSpan.Zero,
        EndTime: TimeSpan.Zero,
        IsRecurrent: false,
        RecurrentEnabled: true,
        SelectedDays: Array.Empty<DayOfWeek>(),
        ExistingItems: _unavailabilities.ToList(),
        IsSaving: false
    );

    // ══════════════════════════════════════════════════════════════════
    // INotifyPropertyChanged
    // ══════════════════════════════════════════════════════════════════

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? n = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));
    private bool Set<T>(ref T f, T v, [CallerMemberName] string? n = null)
    {
        if (EqualityComparer<T>.Default.Equals(f, v)) return false;
        f = v; OnPropertyChanged(n); return true;
    }
}

// ─── Chip filtre/tri actif ────────────────────────────────────────────────────

public record PlannerActiveChip(
    string Label,
    bool IsSort = false,
    DriverTripStatusEnum? DriverStatus = null,
    PassengerReservationStatusEnum? PassengerStatus = null
);
