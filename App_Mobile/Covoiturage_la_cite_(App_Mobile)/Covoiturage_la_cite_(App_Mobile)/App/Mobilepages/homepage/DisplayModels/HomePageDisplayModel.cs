using System.ComponentModel;
using System.Runtime.CompilerServices;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.DisplayModels
{
    public class HomePageDisplayModel : INotifyPropertyChanged
    {
        private UserViewModel _user = new();
        private LiveTrackingCardDisplayModel? _liveTrip;
        private KpiGridDisplayModel _statsKpis = new(new List<KpiCardDisplayModel>());
        private IReadOnlyList<IncomingReservationRequestCardDisplayModel> _incomingRequests = Array.Empty<IncomingReservationRequestCardDisplayModel>();
        private IReadOnlyList<NotificationCardDisplayModel> _notifications = Array.Empty<NotificationCardDisplayModel>();
        private string _requestsSectionTitle = "NOUVELLES DEMANDES / MISES À JOUR";
        private bool _showIncomingRequests = true;
        private bool _showNotifications = true;

        public UserViewModel User { get => _user; set => SetField(ref _user, value); }
        public LiveTrackingCardDisplayModel? LiveTrip { get => _liveTrip; set { SetField(ref _liveTrip, value); OnPropertyChanged(nameof(HasLiveTrip)); } }
        public bool HasLiveTrip => _liveTrip is not null;

        public KpiGridDisplayModel StatsKpis { get => _statsKpis; set => SetField(ref _statsKpis, value); }
        public IReadOnlyList<IncomingReservationRequestCardDisplayModel> IncomingRequests { get => _incomingRequests; set => SetField(ref _incomingRequests, value); }
        public IReadOnlyList<NotificationCardDisplayModel> Notifications { get => _notifications; set => SetField(ref _notifications, value); }
        public string RequestsSectionTitle { get => _requestsSectionTitle; set => SetField(ref _requestsSectionTitle, value); }
        public bool ShowIncomingRequests { get => _showIncomingRequests; set => SetField(ref _showIncomingRequests, value); }
        public bool ShowNotifications { get => _showNotifications; set => SetField(ref _showNotifications, value); }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(name);
            return true;
        }
    }
}
