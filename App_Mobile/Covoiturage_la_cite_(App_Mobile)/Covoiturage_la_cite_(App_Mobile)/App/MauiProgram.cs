using CommunityToolkit.Maui;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.conversationpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.conversationpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.historiquepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.nouveautespage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.plannerpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reviewspage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.searchpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.statpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.view;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.createtrip.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.finances.Services;
using Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.goboard.Services;
using Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.planner.Services;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.search.Services;
using Covoiturage_la_cite__App_Mobile_.Features.search.Utils;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.Services;
using Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Services.Api;
using Covoiturage_la_cite__App_Mobile_.Services.Auth;
using Covoiturage_la_cite__App_Mobile_.Services.Cache;
using Covoiturage_la_cite__App_Mobile_.Services.language;
using Covoiturage_la_cite__App_Mobile_.Services.Map;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Services;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilesettingspage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilesettingspage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.publicprofilepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.publicprofilepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.addvehiclepage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.documentuploadpage.view;
using MauiIcons.Cupertino;
using MauiIcons.Fluent.Filled;
using MauiIcons.FontAwesome;
using MauiIcons.Material;
using Microsoft.Extensions.Logging;
using Microsoft.Maui.Animations;

namespace Covoiturage_la_cite__App_Mobile_.App
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder.UseMauiApp<Covoiturage_la_cite__App_Mobile_.App.App>().ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                fonts.AddFont("FluentSystemIcons-Regular.ttf", "MauiIcons");
                fonts.AddFont("FluentSystemIcons-Filled.ttf", "FluentFilledIcons");
                fonts.AddFont("FluentSystemIcons-Resizable.ttf", "FluentResizableIcons");
                fonts.AddFont("FluentSystemIcons-Light.ttf", "FluentLightIcons");
            }).UseMauiCommunityToolkit()
            .UseMaterialMauiIcons()
             .UseCupertinoMauiIcons()
            .UseFontAwesomeMauiIcons()
            .UseFluentFilledMauiIcons();
            // -- Infrastructure : API + Cache + Auth --
            builder.Services.AddSingleton<IApiService, ApiService>();
            builder.Services.AddSingleton<ISQLiteService, SQLiteService>();
            builder.Services.AddSingleton<IJsonCacheService, JsonCacheService>();
            builder.Services.AddSingleton<IAuthService, AuthServiceHttp>();

            // -- Singletons Shell (vivent pour toute la dur�e de l'app) --
            builder.Services.AddSingleton<ShellControler>();
            builder.Services.AddSingleton<NavigationService>();
            builder.Services.AddSingleton<AppShell>();
            builder.Services.AddSingleton<MainPage>();
            builder.Services.AddSingleton<UserViewModel>(sp =>
            {
                var vm = new UserViewModel();
                // ApiService sera injecté après construction pour éviter la dépendance circulaire
                var api = sp.GetRequiredService<IApiService>();
                vm.SetApiService(api);
                return vm;
            });
            builder.Services.AddSingleton<IStatistiquesService, StatistiquesService>();
            builder.Services.AddSingleton<StatistiquesDisplayController>();
            builder.Services.AddSingleton<IGoboardService, GoboardService>();
            builder.Services.AddSingleton<GoboardDisplayController>();
            builder.Services.AddSingleton<IFinancesService, FinancesService>();
            builder.Services.AddSingleton<FinancesDisplayController>();
            builder.Services.AddSingleton<StatsPageController>(sp =>
            {
                var userVm = sp.GetRequiredService<UserViewModel>();
                var goboard = sp.GetRequiredService<GoboardDisplayController>();
                var stats = sp.GetRequiredService<StatistiquesDisplayController>();
                var finance = sp.GetRequiredService<FinancesDisplayController>();
                return new StatsPageController(goboard, stats, finance,
                    canBeDriver: userVm.Role == UserRole.Driver);
            });
            builder.Services.AddSingleton<IPlannerService, PlannerServiceHttp>();
            builder.Services.AddSingleton<PlannerDisplayController>();
            // PlannerPage enregistré plus bas avec les autres pages Tab
            builder.Services.AddTransient<HomepageDisplayController>();
            builder.Services.AddTransient<HomePageDisplayController>();

            // -- Services Map (ORS) — TODO: migrer vers serveur core au déploiement --
            builder.Services.AddSingleton(_ => new OrsService(new HttpClient(), OrsService.DevApiKey));

            // -- Feature Search --
            builder.Services.AddSingleton<IConnectivity>(Connectivity.Current);
            builder.Services.AddSingleton<ICheckConnexionUtils, CheckConnexionUtils>();
            builder.Services.AddSingleton<ISearchService, SearchServiceHttp>();
            builder.Services.AddSingleton<SearchDisplayController>();
            builder.Services.AddTransient<SearchPage>();

            // -- Pages Tab (Singleton car cachées dans MainView) --
            builder.Services.AddSingleton<Mobilepages.homepage.view.HomePage>();
            builder.Services.AddTransient<Mobilepages.messagepage.DisplayControler.MessagePageDisplayController>(sp =>
                new Mobilepages.messagepage.DisplayControler.MessagePageDisplayController(
                    sp.GetRequiredService<Core.Viewmodels.UserViewModel>()
                ));
            builder.Services.AddSingleton<Mobilepages.messagepage.view.MessagePage>(sp =>
                new Mobilepages.messagepage.view.MessagePage(
                    sp.GetRequiredService<Mobilepages.messagepage.DisplayControler.MessagePageDisplayController>()
                ));
            builder.Services.AddSingleton<Mobilepages.statpage.view.StatPage>();
            builder.Services.AddSingleton<Mobilepages.favorispage.view.FavorisPage>();
            builder.Services.AddSingleton<Mobilepages.profilpage.view.ProfilPage>();
            builder.Services.AddSingleton<PlannerPage>();

            // -- Pages secondaires (existantes) --
            //builder.Services.AddTransient<Mobilepages.trajet_detail.view.TrajetDetailPage>();
            builder.Services.AddTransient<Mobilepages.reservationpage.DisplayControler.ReservationPageDisplayController>(sp =>
                new Mobilepages.reservationpage.DisplayControler.ReservationPageDisplayController(
                    sp.GetRequiredService<Core.Viewmodels.UserViewModel>()
                ));
            builder.Services.AddTransient<Mobilepages.reservationpage.view.ReservationPage>(sp =>
                new Mobilepages.reservationpage.view.ReservationPage(
                    sp.GetRequiredService<Mobilepages.reservationpage.DisplayControler.ReservationPageDisplayController>()
                ));
            builder.Services.AddTransient<Mobilepages.notificationpage.DisplayControler.NotificationPageDisplayController>(sp =>
                new Mobilepages.notificationpage.DisplayControler.NotificationPageDisplayController(
                    sp.GetRequiredService<Core.Viewmodels.UserViewModel>()
                ));
            builder.Services.AddTransient<Mobilepages.notificationpage.view.NotificationPage>(sp =>
                new Mobilepages.notificationpage.view.NotificationPage(
                    sp.GetRequiredService<Mobilepages.notificationpage.DisplayControler.NotificationPageDisplayController>()
                ));
            //builder.Services.AddTransient<Mobilepages.parametres.view.ParametresPage>();
            //builder.Services.AddTransient<Mobilepages.apropos.view.AProposPage>();

            // -- Pages de détail hors-MainView (nouvelles) --
            // Feature controllers (Transient : durée de vie = durée de la page)
            builder.Services.AddTransient<NotificationsDisplayController>();
            builder.Services.AddTransient<NotificationDetailPageDisplayController>();
            builder.Services.AddTransient<NotificationDetailPage>();

            builder.Services.AddTransient<ReservationRequestDisplayController>();
            builder.Services.AddTransient<ReservationRequestDetailPageDisplayController>();
            builder.Services.AddTransient<ReservationRequestDetailPage>();

            builder.Services.AddTransient<TripDetailDisplayController>();
            builder.Services.AddTransient<TripDetailPageDisplayController>();
            builder.Services.AddTransient<TripDetailPage>();

            builder.Services.AddTransient<CreateTripDisplayController>();
            builder.Services.AddTransient<CreateTripPageDisplayController>();
            builder.Services.AddTransient<CreateTripPage>();

            // -- Feature Messaging (ConversationPage pour les détails) --
            builder.Services.AddTransient<ConversationPageDisplayController>();
            builder.Services.AddTransient<ConversationPage>();

            // -- Pages Auth --
            builder.Services.AddTransient<LoginPageDisplayControler>();
            builder.Services.AddTransient<LoginPage>();
            builder.Services.AddTransient<OtpPageDisplayControler>();
            builder.Services.AddTransient<OtpPage>();

            // -- Pages hors-MainView : historique, brouillons, reviews, nouveautés --
            builder.Services.AddTransient<HistoriquePage>();
            builder.Services.AddTransient<Mobilepages.brouillonspage.DisplayControler.BrouillonsPageDisplayController>(sp =>
                new Mobilepages.brouillonspage.DisplayControler.BrouillonsPageDisplayController(
                    sp.GetRequiredService<Core.Viewmodels.UserViewModel>()
                ));
            builder.Services.AddTransient<Mobilepages.brouillonspage.view.BrouillonsPage>(sp =>
                new Mobilepages.brouillonspage.view.BrouillonsPage(
                    sp.GetRequiredService<Mobilepages.brouillonspage.DisplayControler.BrouillonsPageDisplayController>()
                ));
            builder.Services.AddTransient<Mobilepages.brouillonspage.DisplayControler.BrouillonsPageDisplayController>(sp =>
                new Mobilepages.brouillonspage.DisplayControler.BrouillonsPageDisplayController(
                    sp.GetRequiredService<Core.Viewmodels.UserViewModel>()
                ));
            builder.Services.AddTransient<Mobilepages.brouillonspage.view.BrouillonsPage>(sp =>
                new Mobilepages.brouillonspage.view.BrouillonsPage(
                    sp.GetRequiredService<Mobilepages.brouillonspage.DisplayControler.BrouillonsPageDisplayController>()
                ));

            builder.Services.AddTransient<ReviewsPage>();
            builder.Services.AddTransient<Mobilepages.historiquepage.DisplayControler.HistoriquePageDisplayController>(sp =>
                new Mobilepages.historiquepage.DisplayControler.HistoriquePageDisplayController(
                    sp.GetRequiredService<Core.Viewmodels.UserViewModel>()
                ));
            builder.Services.AddTransient<Mobilepages.historiquepage.view.HistoriquePage>(sp =>
                new Mobilepages.historiquepage.view.HistoriquePage(
                    sp.GetRequiredService<Mobilepages.historiquepage.DisplayControler.HistoriquePageDisplayController>()
                ));

            builder.Services.AddTransient<NouveautesPage>();

            // Enregistrement explicite de IAnimationManager si n�cessaire
            builder.Services.AddSingleton<IAnimationManager, AnimationManager>();

            // -- Services langue --
            builder.Services.AddSingleton<ILanguageService, DefaultLanguageService>();

            // -- Feature Profile : services (stubs connectables REST) --
            builder.Services.AddSingleton<ProfileServiceHttp>();
            builder.Services.AddSingleton<IProfileService>(sp => sp.GetRequiredService<ProfileServiceHttp>());
            builder.Services.AddSingleton<IVehicleService>(sp => sp.GetRequiredService<ProfileServiceHttp>());
            builder.Services.AddSingleton<IDocumentService>(sp => sp.GetRequiredService<ProfileServiceHttp>());
            builder.Services.AddSingleton<IFavoritesService, FavoritesServiceHttp>();

            // -- Feature Profile : DisplayControlers --
            builder.Services.AddTransient<ProfileSettingsDisplayControler>();
            builder.Services.AddTransient<PublicProfileDisplayControler>();

            // -- Pages Profile : Page controllers + pages --
            builder.Services.AddTransient<ProfileSettingsPageDisplayControler>();
            builder.Services.AddTransient<PublicProfilePageDisplayControler>();
            builder.Services.AddTransient<ProfileSettingsPage>();
            builder.Services.AddTransient<PublicProfilePage>();

            // -- Placeholder pages overlay (ajout véhicule, upload docs) --
            builder.Services.AddTransient<AddVehiclePage>();
            builder.Services.AddTransient<DocumentUploadPage>();


#if DEBUG
            builder.Logging.AddDebug();
#endif
            return builder.Build();
        }
    }
}
