// Features/planner/views/ui/PlannerPage.xaml.cs
// ════════════════════════════════════════════════════════════════════════
// Code-behind de PlannerPage.
// Responsabilités :
//   - Injecter le DataTemplateSelector sur DayList et AllRidesList
//   - Configurer et brancher l'ItemListController sur AllRidesList
//   - Observer DisplayedItems pour re-évaluer le selector
//   - Charger les données fixtures (à remplacer par API)
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.planner.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Features.planner.Services;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.Views;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.plannerpage.view;

public partial class PlannerPage : ContentView
{
    private readonly PlannerDisplayController _controller;
    private          PlannerItemListController? _listController;
    private bool _isLoaded = false;

    public bool IsOffline { get; private set; }

    public PlannerPage(PlannerDisplayController controller)

    {
        InitializeComponent();
        _controller  = controller;
        BindingContext = controller;
        Loaded += OnLoaded;

        // ── DataTemplateSelector sur la liste du jour ────────────────
        DayList.ItemTemplate = new PlannerDataTemplateSelector();

        // ── Observe les changements pour reconfigurer la liste ────────
        _controller.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(PlannerDisplayController.IsViewAll))
                MainThread.BeginInvokeOnMainThread(() =>
                {
                    if (_controller.IsViewAll)
                        SetupItemList();
                });
        };
    }

    // ══════════════════════════════════════════════════════════════════
    // Cycle de vie
    // ══════════════════════════════════════════════════════════════════

    // ══════════════════════════════════════════════════════════════════
    // Chargement (fixtures → remplacer par API)
    // ══════════════════════════════════════════════════════════════════

    private void OnLoaded(object? sender, EventArgs e)
    {
        if (_isLoaded) return;
        _isLoaded = true;
        LoadData();
    }

    private void LoadData()
    {
        var userVm = IPlatformApplication.Current.Services.GetRequiredService<UserViewModel>();
        
        // Correction : remplacer l'expression switch par une instruction switch classique
        UserRole role;
        switch (userVm.Role)
        {
            case (Core.Models.UserRole)UserRole.Driver:
                role = UserRole.Driver;
                break;
            case (Core.Models.UserRole)UserRole.Passenger:
                role = UserRole.Passenger;
                break;
            default:
                role = UserRole.Passenger; // fallback
                break;
        }
        var items = userVm.Role == (Core.Models.UserRole)UserRole.Driver
            ? PlannerFixtures.DriverItems()
            : PlannerFixtures.PassengerItems();
        _controller.SetData(role, items);

        // TODO : charger depuis API
        // var items = await _apiService.GetPlannerItemsAsync();
        // _controller.SetData(role, items);
    }

    // ══════════════════════════════════════════════════════════════════
    // Configuration ItemList (mode Voir tout)
    // ══════════════════════════════════════════════════════════════════

    private void SetupItemList()
    {
        if (_listController != null) return; // déjà configuré

        _listController = new PlannerItemListController(_controller);
        AllRidesList.SetController(_listController);
    }
}

// ════════════════════════════════════════════════════════════════════════
// DataTemplateSelector — DriverRideItem ↔ PassengerRideItem
// ════════════════════════════════════════════════════════════════════════

public class PlannerDataTemplateSelector : DataTemplateSelector
{
    private static readonly DataTemplate DriverTemplate   = MakeDriverTemplate();
    private static readonly DataTemplate PassengerTemplate = MakePassengerTemplate();

    protected override DataTemplate OnSelectTemplate(object item, BindableObject container)
        => item is DriverRideItem ? DriverTemplate : PassengerTemplate;

    // ── Template Conducteur ──────────────────────────────────────────

    private static DataTemplate MakeDriverTemplate() => new(() =>
    {
        var card = new DriverTripCard();
        card.SetBinding(DriverTripCard.ModelProperty,
            new Binding(nameof(DriverRideItem.Card)));

        card.CancelClicked += (s, e) =>
        {
            // TODO : déclencher commande via MessagingCenter ou EventAggregator
        };

        card.GestureRecognizers.Add(new TapGestureRecognizer
        {
            Command = new Command(async () =>
            {
                var tripId = card.Model?.TripId;
                if (string.IsNullOrEmpty(tripId)) return;
                var escaped = Uri.EscapeDataString(tripId);
                await Shell.Current.GoToAsync(
                    $"tripdetail?tripId={escaped}&viewerRole=driver_owner&source=planner");
            })
        });

        return card;
    });

    // ── Template Passager ────────────────────────────────────────────

    private static DataTemplate MakePassengerTemplate() => new(() =>
    {
        var card = new PassengerReservationCard();
        card.SetBinding(PassengerReservationCard.ModelProperty,
            new Binding(nameof(PassengerRideItem.Card)));

        card.CancelClicked  += (s, e) => { };
        card.MessageClicked += (s, e) => { };
        card.TrackClicked   += (s, e) => { };
        card.RateClicked    += (s, e) => { };

        card.GestureRecognizers.Add(new TapGestureRecognizer
        {
            Command = new Command(async () =>
            {
                var tripId = card.Model?.TripId;
                if (string.IsNullOrEmpty(tripId)) return;
                var escaped = Uri.EscapeDataString(tripId);
                await Shell.Current.GoToAsync(
                    $"tripdetail?tripId={escaped}&viewerRole=passenger&source=planner");
            })
        });

        return card;
    });
}

// ════════════════════════════════════════════════════════════════════════
// ItemListController spécialisé Planner
// Recherche + filtres statut + tri pour PlannerRideItem
// ════════════════════════════════════════════════════════════════════════

public class PlannerItemListController : Covoiturage_la_cite__App_Mobile_.Shared.ItemList.ItemListController<PlannerRideItem>
{
    private readonly PlannerDisplayController _plannerCtrl;

    public PlannerItemListController(PlannerDisplayController ctrl)
        : base(BuildConfig(ctrl))
    {
        _plannerCtrl = ctrl;

        // Synchronise les items quand le controller planner met à jour
        _plannerCtrl.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(PlannerDisplayController.DisplayedItems))
                UpdateSource(_plannerCtrl.DisplayedItems);
        };

        // Synchronise les filtres de statut vers le controller planner
        FilterChanged += OnFilterChanged;
        SortChanged   += OnSortChanged;
    }

    // ── Construction de la config ────────────────────────────────────

    private static Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ItemListConfig<PlannerRideItem>
        BuildConfig(PlannerDisplayController ctrl)
    {
        var driverStatusFilters = new[]
        {
            DriverTripStatusEnum.Published, DriverTripStatusEnum.Full,
            DriverTripStatusEnum.Confirmed, DriverTripStatusEnum.InProgress,
            DriverTripStatusEnum.Completed, DriverTripStatusEnum.Cancelled,
        }.Select(s => new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListFilter<PlannerRideItem>
        {
            Id        = $"driver_{s}",
            Label     = s switch
            {
                DriverTripStatusEnum.Published  => "Publiée",
                DriverTripStatusEnum.Full       => "Complet",
                DriverTripStatusEnum.Confirmed  => "Confirmée",
                DriverTripStatusEnum.InProgress => "En cours",
                DriverTripStatusEnum.Completed  => "Terminée",
                DriverTripStatusEnum.Cancelled  => "Annulée",
                _                               => s.ToString(),
            },
            Predicate = item => item is DriverRideItem d && d.Status == s,
        }).ToArray();

        var passengerStatusFilters = new[]
        {
            PassengerReservationStatusEnum.Confirmed, PassengerReservationStatusEnum.Pending,
            PassengerReservationStatusEnum.InProgress, PassengerReservationStatusEnum.Completed,
            PassengerReservationStatusEnum.Cancelled,  PassengerReservationStatusEnum.Rejected,
        }.Select(s => new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListFilter<PlannerRideItem>
        {
            Id        = $"passenger_{s}",
            Label     = s switch
            {
                PassengerReservationStatusEnum.Confirmed  => "Confirmée",
                PassengerReservationStatusEnum.Pending    => "En attente",
                PassengerReservationStatusEnum.InProgress => "En cours",
                PassengerReservationStatusEnum.Completed  => "Terminée",
                PassengerReservationStatusEnum.Cancelled  => "Annulée",
                PassengerReservationStatusEnum.Rejected   => "Rejetée",
                _                                         => s.ToString(),
            },
            Predicate = item => item is PassengerRideItem p && p.Status == s,
        }).ToArray();

        return new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ItemListConfig<PlannerRideItem>
        {
            SearchPlaceholder = "Rechercher un trajet…",

            // Champs indexés pour la recherche plein-texte
            SearchFields = item => item switch
            {
                DriverRideItem d => new[]
                {
                    d.Card.Route.FromLabel, d.Card.Route.ToLabel,
                    d.Card.TimeLabel, d.Card.PassengerLabel,
                },
                PassengerRideItem p => new[]
                {
                    p.Card.DriverName, p.Card.Route.FromLabel,
                    p.Card.Route.ToLabel, p.Card.TimeLabel,
                    p.Card.VehicleLabel,
                },
                _ => Array.Empty<string>(),
            },

            FilterGroups = new[]
            {
                new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListFilterGroup<PlannerRideItem>
                {
                    GroupLabel = "Statut Conducteur",
                    Filters    = driverStatusFilters,
                },
                new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListFilterGroup<PlannerRideItem>
                {
                    GroupLabel = "Statut Passager",
                    Filters    = passengerStatusFilters,
                },
            },

            SortOptions = new[]
            {
                new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListSort<PlannerRideItem>
                {
                    Id     = "date_asc",
                    Label  = "Date (plus tôt)",
                    Sorter = items => items.OrderBy(GetDate),
                    IsDefault = true,
                },
                new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListSort<PlannerRideItem>
                {
                    Id     = "date_desc",
                    Label  = "Date (plus tard)",
                    Sorter = items => items.OrderByDescending(GetDate),
                },
                new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListSort<PlannerRideItem>
                {
                    Id     = "price_asc",
                    Label  = "Prix croissant",
                    Sorter = items => items.OrderBy(GetPrice),
                },
                new Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels.ListSort<PlannerRideItem>
                {
                    Id     = "price_desc",
                    Label  = "Prix décroissant",
                    Sorter = items => items.OrderByDescending(GetPrice),
                },
            },

            Items             = ctrl.DisplayedItems.ToList(),
            EmptyStateTitle   = "Aucun trajet trouvé",
            EmptyStateSubtitle = "Essayez d'élargir vos filtres ou votre recherche.",
            ShowNoInternet    = false,
        };
    }

    private static DateTime GetDate(PlannerRideItem i) => i switch
    {
        DriverRideItem d    => d.Date,
        PassengerRideItem p => p.Date,
        _                   => DateTime.MaxValue,
    };

    private static decimal GetPrice(PlannerRideItem i) => i switch
    {
        DriverRideItem d    => d.Card.Price,
        PassengerRideItem p => p.Card.Price,
        _                   => 0m,
    };

    // ── Synchronisation filtres → PlannerDisplayController ───────────

    private void OnFilterChanged(object? sender, IReadOnlyList<string> activeFilterIds)
    {
        var driverStatuses = new HashSet<DriverTripStatusEnum>();
        var passengerStatuses = new HashSet<PassengerReservationStatusEnum>();

        foreach (var id in activeFilterIds)
        {
            if (id.StartsWith("driver_") &&
                Enum.TryParse<DriverTripStatusEnum>(id["driver_".Length..], out var ds))
                driverStatuses.Add(ds);

            if (id.StartsWith("passenger_") &&
                Enum.TryParse<PassengerReservationStatusEnum>(id["passenger_".Length..], out var ps))
                passengerStatuses.Add(ps);
        }

        _plannerCtrl.SyncFiltersFromItemList(driverStatuses, passengerStatuses);
    }

    private void OnSortChanged(object? sender, string sortId)
    {
        var opt = sortId switch
        {
            "date_desc"  => PlannerSortOption.DateDesc,
            "price_asc"  => PlannerSortOption.PriceAsc,
            "price_desc" => PlannerSortOption.PriceDesc,
            _            => PlannerSortOption.DateAsc,
        };
        _plannerCtrl.SetSortCommand.Execute(opt);
    }

    // Événements exposés pour la synchronisation bi-directionnelle
    public event EventHandler<IReadOnlyList<string>>? FilterChanged;
    public event EventHandler<string>?                SortChanged;
}

