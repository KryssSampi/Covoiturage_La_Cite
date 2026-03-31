using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.favorispage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.plannerpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.statpage.view;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.Features.customshell.views.components;

public partial class MainView : ContentPage
{ // ─────────────────────────────────────────────────────────────
  //  Dépendances (injectées via DI)
  // ─────────────────────────────────────────────────────────────
    private readonly NavigationService _navService;
    private readonly ShellControler _shellControler;

    // ─────────────────────────────────────────────────────────────
    //  Cache des vues — chaque vue est instanciée UNE SEULE FOIS
    //  et conservée en mémoire pour toute la durée de l'app.
    //  Lazy<T> = instanciation au premier accès uniquement.
    // ─────────────────────────────────────────────────────────────
    private readonly Dictionary<string, Lazy<ContentView>> _viewCache;

    public MainView(NavigationService navService, ShellControler shellControler)
    {
        InitializeComponent();

        _navService = navService;
        _shellControler = shellControler;

        // ── Initialisation du cache de vues ──
        // Chaque ContentView est résolu via DI pour supporter l'injection
        // dans les ViewModels des pages principales.
        _viewCache = new Dictionary<string, Lazy<ContentView>>(
            StringComparer.OrdinalIgnoreCase)
        {
            ["accueil"] = new(() => ResolveView<HomePage>()),
            ["planifier"] = new(() => ResolveView<PlannerPage>()),
            ["messages"] = new(() => ResolveView<NotificationPage>()),
            ["stats"] = new(() => ResolveView<StatPage>()),
            ["profil"] = new(() => ResolveView<ProfilPage>()),
            ["favoris"] = new(() => ResolveView<FavorisPage>()),
        };

        // ── Branchement sur le NavigationService ──
        _navService.MainNavigationRequested += OnMainNavigationRequested;

        // ── Vue initiale (accueil) ──
        SwapContent("accueil", animate: false);
    }

    // ─────────────────────────────────────────────────────────────
    //  Réception d'une demande de navigation principale
    // ─────────────────────────────────────────────────────────────
    private void OnMainNavigationRequested(MainNavRequest request)
    {
        SwapContent(request.Route, animate: true);
    }

    // ─────────────────────────────────────────────────────────────
    //  Swap du contenu central — seule opération visuelle
    // ─────────────────────────────────────────────────────────────
    private void SwapContent(string route, bool animate)
    {
        if (!_viewCache.TryGetValue(route, out var viewFactory)) return;

        MainThread.BeginInvokeOnMainThread(async () =>
        {
            var view = viewFactory.Value; // Instancie si premier accès

            if (animate && ContentZone.Content is not null)
            {
                // Transition légère — fondu rapide uniquement sur le contenu
                await ContentZone.FadeTo(0, 80, Easing.Linear);
                ContentZone.Content = view;
                await ContentZone.FadeTo(1, 120, Easing.Linear);
            }
            else
            {
                ContentZone.Content = view;
            }

            // Synchronise le titre de la TopBar
            _shellControler.UpdateTitle(
                RouteToTitle(route));
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Résolution DI d'une vue
    // ─────────────────────────────────────────────────────────────
    private static T ResolveView<T>() where T : ContentView
    {
        return IPlatformApplication.Current!.Services.GetService<T>()
            ?? Activator.CreateInstance<T>();
    }

    // ─────────────────────────────────────────────────────────────
    //  Mapping route → titre affiché dans la TopBar
    // ─────────────────────────────────────────────────────────────
    private static string RouteToTitle(string route) => route switch
    {
        "accueil" => "La Cité Covoiturage",
        "trajets" => "Mes Trajets",
        "messages" => "Messages",
        "stats" => "Statistiques",
        "favoris" => "Mes Favoris",
        "profil" => "Mon Profil",
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

