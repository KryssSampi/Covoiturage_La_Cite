using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Core.Config;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;
using NotificationType = Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels.NotificationType;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.DisplayControler
{
    public class HomePageDisplayController
    {
        private readonly StatistiquesDisplayController _statsController;
        private readonly UserViewModel _userViewModel;
        private readonly HomepageDisplayController _homepageFeature;
        private bool _initialized;

        public HomePageDisplayModel DisplayModel { get; }
        public HomepageDisplayController HomepageFeature => _homepageFeature;

        public HomePageDisplayController(
            UserViewModel userViewModel,
            StatistiquesDisplayController statsController,
            HomepageDisplayController homepageFeature)
        {
            _userViewModel = userViewModel;
            _statsController = statsController;
            _homepageFeature = homepageFeature;

            if (string.IsNullOrWhiteSpace(_userViewModel.FirstName))
                _userViewModel.Load(UserFixtures.CreateUserModel());

            DisplayModel = new HomePageDisplayModel
            {
                User = _userViewModel,
                LiveTrip = BuildLiveTrip(),
                StatsKpis = StatistiquesFixtures.KpiGrid(),
                IncomingRequests = BuildIncomingRequests(),
                Notifications = BuildNotifications(),
            };

            ConfigureRequestsSection();

            var userId = UserFixtures.CreateUserModel().Id;
            var favoritePlaces = LieuxFavorisFixtures.CreateForUser(userId);
            _homepageFeature.SetSearchBar(
                HomepageDisplayConverter.ToSearchBar(favoritePlaces));

            _homepageFeature.SetQuickNav(
                HomepageDisplayConverter.ToQuickNav(HomeQuickNavConfig.Items));
        }

        public async Task InitializeAsync()
        {
            if (_initialized) return;
            _initialized = true;

            await _statsController.LoadAsync();
            DisplayModel.StatsKpis = _statsController.KpiGrid;
        }

        private static LiveTrackingCardDisplayModel BuildLiveTrip()
        {
            return new LiveTrackingCardDisplayModel(
                DriverAvatar: new AvatarDisplayModel("AL", "#E8F0FE", "#1A56CC"),
                DriverName: "Alex Lavoie",
                DriverRating: 4.8,
                VehicleLabel: "Toyota Corolla � Noire � ABC-4521",
                EtaMinutes: 7,
                MapImageSource: "homepagebackground.png"
            );
        }

        private static IReadOnlyList<IncomingReservationRequestCardDisplayModel> BuildIncomingRequests()
        {
            return new List<IncomingReservationRequestCardDisplayModel>
            {
                new(
                    PassengerAvatar: new AvatarDisplayModel("ML", "#FDECEA", "#E24B4A"),
                    PassengerName: "Marie Lefebvre",
                    PassengerRating: 4.6,
                    PassengerTripCount: 12,
                    Route: new RouteDisplayModel("Barrhaven", "Campus La Cit�"),
                    TripTimeLabel: "Demain � 07:40",
                    Price: 12,
                    SeatsInfo: 3
                ),
                new(
                    PassengerAvatar: new AvatarDisplayModel("TP", "#E1F5EE", "#0F6E56"),
                    PassengerName: "Thomas Pich�",
                    PassengerRating: 4.9,
                    PassengerTripCount: 28,
                    Route: new RouteDisplayModel("Orl�ans", "Campus La Cit�"),
                    TripTimeLabel: "Mercredi � 08:15",
                    Price: 10,
                    SeatsInfo: 2
                )
            };
        }

        private static IReadOnlyList<NotificationCardDisplayModel> BuildNotifications()
        {
            return new List<NotificationCardDisplayModel>
            {
                new(
                    Avatar: new AvatarDisplayModel("JL", "#E8F0FE", "#1A56CC"),
                    SenderName: "Julie Landry",
                    Message: "Votre demande a �t� accept�e.",
                    TimeLabel: "Il y a 3 min",
                    Type: NotificationType.Confirmed,
                    Route: new RouteDisplayModel("Campus", "ByWard"),
                    HasAcceptAction: false,
                    HasDeclineAction: false
                ),
                new(
                    Avatar: new AvatarDisplayModel("RP", "#FAEEDA", "#F59E0B"),
                    SenderName: "Rachid P.",
                    Message: "Votre trajet a �t� annul�.",
                    TimeLabel: "Il y a 12 min",
                    Type: NotificationType.Cancelled,
                    Route: new RouteDisplayModel("Gatineau", "Campus"),
                    HasAcceptAction: false,
                    HasDeclineAction: false
                )
            };
        }

        private void ConfigureRequestsSection()
        {
            bool isDriver = _userViewModel.Role == UserRole.Driver;
            DisplayModel.RequestsSectionTitle = isDriver
                ? "NOUVELLES DEMANDES"
                : "MISE � JOUR SUR VOS DEMANDES";
            DisplayModel.ShowIncomingRequests = isDriver;
            DisplayModel.ShowNotifications = !isDriver;
        }

    }
}
