// AppShell.xaml.cs
// Shell épuré — gardien du Flyout et des pages hors-wrapper.
// La navigation entre onglets est interceptée et déléguée au NavigationService.

// Pages hors-wrapper — importer au fur et à mesure
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.searchpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.conversationpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.historiquepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.brouillonspage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reviewspage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.nouveautespage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilesettingspage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.publicprofilepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.addvehiclepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.documentuploadpage.view;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.views.components;
using Covoiturage_la_cite__App_Mobile_.Services.Auth;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;

namespace Covoiturage_la_cite__App_Mobile_
{
    public partial class AppShell : Shell
    {
        private readonly ShellControler _shellControler;
        private readonly NavigationService _navService;

        private readonly IAuthService _authService;

        public AppShell(ShellControler shellControler, NavigationService navService, IAuthService authService)
        {
            InitializeComponent();

            _shellControler = shellControler;
            _navService = navService;
            _authService = authService;

            BindingContext = shellControler;

            // Cache l'icône flyout native (on utilise notre TopBar)
            FlyoutIcon = new FileImageSource(); // Icône vide

            RegisterRoutes();
        }

        /// <summary>
        /// Vérifie l'état d'auth au démarrage et redirige si nécessaire.
        /// Appelé depuis App.xaml.cs après que le Shell est affiché.
        /// </summary>
        public async Task CheckAuthAndRedirectAsync()
        {
            if (!_authService.IsLoggedIn)
                await GoToAsync("login");
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
            Routing.RegisterRoute("reservation",              typeof(ReservationPage));
            Routing.RegisterRoute("search",                   typeof(SearchPage));

            // ── Pages de détail (hors-MainView) ──
            Routing.RegisterRoute("notificationdetail",       typeof(NotificationDetailPage));
            Routing.RegisterRoute("reservationrequestdetail", typeof(ReservationRequestDetailPage));
            Routing.RegisterRoute("tripdetail",               typeof(TripDetailPage));
            Routing.RegisterRoute("createtrip",               typeof(CreateTripPage));
            Routing.RegisterRoute("conversation",             typeof(ConversationPage));
            Routing.RegisterRoute("historique",               typeof(HistoriquePage));
            Routing.RegisterRoute("brouillons",               typeof(BrouillonsPage));
            Routing.RegisterRoute("reviews",                  typeof(ReviewsPage));
            Routing.RegisterRoute("nouveautes",               typeof(NouveautesPage));
            // Routing.RegisterRoute("payment",                  typeof(PaymentPage));
            // Routing.RegisterRoute("avis",                     typeof(AvisPage));
            Routing.RegisterRoute("login",   typeof(LoginPage));
            Routing.RegisterRoute("otp",     typeof(OtpPage));

            Routing.RegisterRoute("profileSettings",  typeof(ProfileSettingsPage));
            Routing.RegisterRoute("publicProfile",    typeof(PublicProfilePage));
            Routing.RegisterRoute("addVehicle",       typeof(AddVehiclePage));
            Routing.RegisterRoute("uploadDocuments",  typeof(DocumentUploadPage));
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