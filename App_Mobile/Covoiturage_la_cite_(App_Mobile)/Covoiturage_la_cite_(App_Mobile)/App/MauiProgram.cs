using CommunityToolkit.Maui;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.plannerpage.view;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.searchpage.view;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.search.Services;
using Covoiturage_la_cite__App_Mobile_.Features.search.Utils;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.planner.Services;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.Services;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;
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
                fonts.AddFont("FluentSystemIcons-Regular.ttf", "FluentRegularIcons");
                fonts.AddFont("FluentSystemIcons-Filled.ttf", "FluentFilledIcons");
                fonts.AddFont("FluentSystemIcons-Resizable.ttf", "FluentResizableIcons");
                fonts.AddFont("FluentSystemIcons-Light.ttf", "FluentLightIcons");
            }).UseMauiCommunityToolkit()
            .UseMaterialMauiIcons()
             .UseCupertinoMauiIcons()
            .UseFontAwesomeMauiIcons()
            .UseFluentFilledMauiIcons();
            // -- Singletons Shell (vivent pour toute la dur�e de l'app) --
            builder.Services.AddSingleton<ShellControler>();
            builder.Services.AddSingleton<NavigationService>();
            builder.Services.AddSingleton<AppShell>();
            builder.Services.AddSingleton<MainPage>();
            builder.Services.AddSingleton<UserViewModel>();
            builder.Services.AddSingleton<IStatistiquesService, StatistiquesService>();
            builder.Services.AddSingleton<StatistiquesDisplayController>();
            builder.Services.AddSingleton<IPlannerService, PlannerService>();
            builder.Services.AddSingleton<PlannerDisplayController>();
            builder.Services.AddTransient<PlannerPage>();
            builder.Services.AddTransient<HomepageDisplayController>();
            builder.Services.AddTransient<HomePageDisplayController>();

            // -- Feature Search --
            builder.Services.AddSingleton<IConnectivity>(Connectivity.Current);
            builder.Services.AddSingleton<ICheckConnexionUtils, CheckConnexionUtils>();
            builder.Services.AddSingleton<ISearchService, SearchService>();
            builder.Services.AddSingleton<SearchDisplayController>();
            builder.Services.AddTransient<SearchPage>();
            // -- Pages Tab -- (lazy via DataTemplate, mais enregistr�es pour DI)
            builder.Services.AddTransient<Mobilepages.homepage.view.HomePage>();
            //builder.Services.AddTransient<Mobilepages.trajets.view.TrajetsPage>();
            //builder.Services.AddTransient<Mobilepages.messages.view.MessagesPage>();
            builder.Services.AddTransient<Mobilepages.statpage.view.StatPage>();
            //builder.Services.AddTransient<Mobilepages.profil.view.ProfilPage>();
            // -- Pages secondaires --
            //builder.Services.AddTransient<Mobilepages.trajet_detail.view.TrajetDetailPage>();
            builder.Services.AddTransient<Mobilepages.reservationpage.view.ReservationPage>();
            builder.Services.AddTransient<Mobilepages.notificationpage.view.NotificationPage>();
            //builder.Services.AddTransient<Mobilepages.parametres.view.ParametresPage>();
            //builder.Services.AddTransient<Mobilepages.apropos.view.AProposPage>();

            // Enregistrement explicite de IAnimationManager si n�cessaire
            builder.Services.AddSingleton<IAnimationManager, AnimationManager>();


#if DEBUG
            builder.Logging.AddDebug();
#endif
            return builder.Build();
        }
    }
}
