// AppShell.xaml.cs
// Shell épuré — gardien du Flyout et des pages hors-wrapper.
// La navigation entre onglets est interceptée et déléguée au NavigationService.

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationpage.view;
// Pages hors-wrapper — importer au fur et à mesure
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.searchpage.view;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.views.components;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;

namespace Covoiturage_la_cite__App_Mobile_
{
    public partial class AppShell : Shell
    {
        private readonly ShellControler _shellControler;
        private readonly NavigationService _navService;

        public AppShell(ShellControler shellControler, NavigationService navService)
        {
            InitializeComponent();

            _shellControler = shellControler;
            _navService = navService;

            BindingContext = shellControler;
            FlyoutIcon = null;
            Shell.SetNavBarIsVisible(this, false);

            RegisterRoutes();
        }

        // ─────────────────────────────────────────────────────────────
        //  Routes des pages hors-wrapper
        //  Ajouter ici chaque page qui sort du wrapper MainPage.
        //
        //  RÈGLE :
        //    • Page avec back natif, focus total, flux → ici
        //    • Page onglet principal                  → RouteRegistry.MainRoutes
        // ─────────────────────────────────────────────────────────────
        private static void RegisterRoutes()
        {
            // ── Flux & modales ──
            Routing.RegisterRoute("reservation",   typeof(ReservationPage));
            Routing.RegisterRoute("notifications", typeof(NotificationPage));
            Routing.RegisterRoute("search",        typeof(SearchPage));
            // Routing.RegisterRoute("trajet_detail", typeof(TrajetDetailPage));
            // Routing.RegisterRoute("payment",       typeof(PaymentPage));
            // Routing.RegisterRoute("avis",          typeof(AvisPage));
            // Routing.RegisterRoute("login",         typeof(LoginPage));
            // Routing.RegisterRoute("onboarding",    typeof(OnboardingPage));
        }

        // ─────────────────────────────────────────────────────────────
        //  Interception de la navigation Shell
        //
        //  Si une route principale arrive ici (via GoToAsync ou deep link),
        //  on l'intercepte et on la délègue au NavigationService.
        //  Les routes hors-wrapper passent normalement.
        // ─────────────────────────────────────────────────────────────
        protected override void OnNavigating(ShellNavigatingEventArgs args)
        {
            var target = args.Target.Location.OriginalString
                .TrimStart('/')
                .Split('/', StringSplitOptions.RemoveEmptyEntries)
                .LastOrDefault() ?? string.Empty;

            // Nettoie le suffixe "_page" si présent (ex: "accueil_page" → "accueil")
            var route = target.EndsWith("_page")
                ? target[..^5]
                : target;

            if (NavigationService.IsMainRoute(route))
            {
                // ── Bloque Shell, délègue au NavigationService ──
                args.Cancel();
                _navService.GoTo(route);
                return;
            }

            // ── Laisse passer les routes hors-wrapper ──
            base.OnNavigating(args);
        }

        // ─────────────────────────────────────────────────────────────
        //  Post-navigation : sync du titre pour les pages hors-wrapper
        // ─────────────────────────────────────────────────────────────
        protected override void OnNavigated(ShellNavigatedEventArgs args)
        {
            base.OnNavigated(args);

            // Ne met à jour le titre que pour les pages hors-wrapper
            // (MainPage gère le sien via SwapContent)
            if (CurrentPage is not null &&
                CurrentPage.GetType().Name != nameof(MainView))
            {
                _shellControler.UpdateTitle(
                    CurrentPage.Title ?? "La Cité Covoiturage");
            }
        }
    }
}