using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.favorispage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.messagepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.plannerpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.statpage.view;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.Features.customshell.views.components;

/// <summary>
/// MainView — Custom Shell avec navigation instantanée.
/// 
/// Architecture :
/// - Toutes les vues sont pré-créées au démarrage (eager loading)
/// - Navigation = simple swap de ContentView (instantané)
/// - TopBar + TabBar fixes, seul ContentZone change
/// </summary>
public partial class MainView : ContentPage
{
    // ─────────────────────────────────────────────────────────────
    //  Dépendances
    // ─────────────────────────────────────────────────────────────
    private readonly NavigationService _navService;
    private readonly ShellControler _shellControler;
    private readonly UserViewModel _userViewModel;

    // ─────────────────────────────────────────────────────────────
    //  Cache des vues — PRÉ-CRÉÉES au démarrage, pas de Lazy
    // ─────────────────────────────────────────────────────────────
    private readonly Dictionary<string, ContentView> _viewCache = new(StringComparer.OrdinalIgnoreCase);
    private string _currentRoute = string.Empty;
    private bool _isInitialized;

    public MainView(NavigationService navService, ShellControler shellControler, UserViewModel userViewModel)
    {
        InitializeComponent();

        _navService = navService;
        _shellControler = shellControler;
        _userViewModel = userViewModel;

        // ── S'abonner AVANT d'initialiser les vues ──
        _navService.MainNavigationRequested += OnMainNavigationRequested;
    }

    // ─────────────────────────────────────────────────────────────
    //  Initialisation différée — appelée après que la page est visible
    // ─────────────────────────────────────────────────────────────
    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (_isInitialized) return;
        _isInitialized = true;

        // ── Affiche le loader d'initialisation ──
        ShowLoader("Préparation...");

        // ── Pré-crée toutes les vues en background ──
        await Task.Run(() => PreCreateAllViews());

        // ── Cache le loader et affiche l'accueil ──
        await HideLoaderAsync(animate: false);
        TabBar.ApplyRole(_userViewModel.Role);
        SwapContent("accueil", animate: false);
    }

    // ─────────────────────────────────────────────────────────────
    //  Pré-création de toutes les vues (eager loading)
    // ─────────────────────────────────────────────────────────────
    private void PreCreateAllViews()
    {
        var services = IPlatformApplication.Current?.Services;
        if (services is null) return;

        // Crée les vues sur le UI thread (obligatoire pour XAML)
        // mais les données sont chargées en lazy dans OnLoaded de chaque vue
        MainThread.InvokeOnMainThreadAsync(() =>
        {
            try
            {
                _viewCache["accueil"]             = services.GetRequiredService<HomePage>();
                _viewCache["planifier"]           = services.GetRequiredService<PlannerPage>();
                _viewCache["messages"]            = services.GetRequiredService<MessagePage>();
                _viewCache["stats"]               = services.GetRequiredService<StatPage>();
                _viewCache["profil"]              = services.GetRequiredService<ProfilPage>();
                _viewCache["favoris"]             = services.GetRequiredService<FavorisPage>();
                // Routes SideNav → pages existantes
                _viewCache["trajets"]             = _viewCache["planifier"];
                _viewCache["demandes"]            = _viewCache["favoris"];
                _viewCache["conducteurs_favoris"] = _viewCache["favoris"];

                System.Diagnostics.Debug.WriteLine("[MainView] ✅ Toutes les vues pré-créées");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[MainView] ❌ Erreur pré-création: {ex.Message}");
            }
        }).Wait();
    }

    // ─────────────────────────────────────────────────────────────
    //  Loader visuel — utilise l'overlay XAML
    // ─────────────────────────────────────────────────────────────
    private void ShowLoader(string? message = null)
    {
        LoaderText.Text = message ?? "Chargement...";
        LoaderSpinner.IsRunning = true;
        LoaderOverlay.IsVisible = true;
        LoaderOverlay.Opacity = 1;
    }

    private async Task HideLoaderAsync(bool animate = true)
    {
        if (animate)
        {
            await LoaderOverlay.FadeTo(0, 150, Easing.CubicOut);
        }
        LoaderOverlay.IsVisible = false;
        LoaderSpinner.IsRunning = false;
    }

    // ─────────────────────────────────────────────────────────────
    //  Navigation interne — réception des demandes
    // ─────────────────────────────────────────────────────────────
    private void OnMainNavigationRequested(MainNavRequest request)
    {
        // Déjà sur cette route ? Ignore.
        if (request.Route == _currentRoute) return;

        SwapContent(request.Route, animate: true);
    }

    // ─────────────────────────────────────────────────────────────
    //  Swap du contenu — avec loader pendant la transition
    // ─────────────────────────────────────────────────────────────
    private async void SwapContent(string route, bool animate)
    {
        if (!_viewCache.TryGetValue(route, out var view))
        {
            System.Diagnostics.Debug.WriteLine($"[MainView] ⚠️ Route inconnue: {route}");
            return;
        }

        // ── Affiche le loader si animation ──
        if (animate)
        {
            ShowLoader(RouteToTitle(route));
            await Task.Delay(80); // Petit délai pour que le loader s'affiche
        }

        // ── Lifecycle : OnDisappearing sur l'ancienne vue ──
        if (ContentZone.Content is ContentView oldView)
        {
            (oldView as IPageLifecycle)?.OnNavigatedFrom();
        }

        // ── Swap du contenu ──
        ContentZone.Content = view;
        _currentRoute = route;

        // ── Lifecycle : OnAppearing sur la nouvelle vue ──
        (view as IPageLifecycle)?.OnNavigatedTo();

        // ── Activation spéciale pour StatPage ──
        if (view is StatPage statPage)
            _ = statPage.OnActivatedAsync();

        // ── Met à jour le titre ──
        _shellControler.UpdateTitle(RouteToTitle(route));

        // ── Cache le loader avec animation ──
        if (animate)
        {
            await Task.Delay(100); // Laisse le contenu se rendre
            await HideLoaderAsync();
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Mapping route → titre
    // ─────────────────────────────────────────────────────────────
    private static string RouteToTitle(string route) => route switch
    {
        "accueil"             => "La Cité Covoiturage",
        "planifier"           => "Planifier",
        "messages"            => "Messages",
        "stats"               => "Statistiques",
        "favoris"             => "Mes Favoris",
        "profil"              => "Mon Profil",
        "trajets"             => "Mes Trajets",
        "demandes"            => "Mes Demandes",
        "conducteurs_favoris" => "Conducteurs Favoris",
        _ => "La Cité Covoiturage",
    };

    // ─────────────────────────────────────────────────────────────
    //  Nettoyage
    // ─────────────────────────────────────────────────────────────
    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        _navService.MainNavigationRequested -= OnMainNavigationRequested;
    }
}

/// <summary>
/// Interface optionnelle pour les vues qui veulent des callbacks de navigation
/// </summary>
public interface IPageLifecycle
{
    void OnNavigatedTo();
    void OnNavigatedFrom();
}

