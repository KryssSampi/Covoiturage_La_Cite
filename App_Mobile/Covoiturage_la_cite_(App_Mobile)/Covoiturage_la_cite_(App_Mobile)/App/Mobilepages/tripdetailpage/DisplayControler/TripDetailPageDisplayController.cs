// ============================================================
//  App/Mobilepages/tripdetailpage/DisplayControler/
//  TripDetailPageDisplayController.cs
//
//  Orchestre TripDetailPage :
//   - Reçoit tripId + viewerRole + source + sourceStatus via QueryProperty
//   - Charge le TripViewData (fixtures → TODO API)
//   - Nourrit TripDetailDisplayController (feature)
//   - Synchronise le PageModel
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.DisplayControler
{
    [QueryProperty(nameof(TripId),       "tripId")]
    [QueryProperty(nameof(ViewerRole),   "viewerRole")]
    [QueryProperty(nameof(Source),       "source")]
    [QueryProperty(nameof(SourceStatus), "sourceStatus")]
    public class TripDetailPageDisplayController : INotifyPropertyChanged
    {
        private readonly TripDetailDisplayController _featureController;
        private readonly TripDetailPageDisplayModel  _pageModel;

        private string? _tripId;
        private string? _viewerRole;
        private string? _source;
        private string? _sourceStatus;

        public TripDetailPageDisplayModel PageModel => _pageModel;

        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        public TripDetailPageDisplayController(TripDetailDisplayController featureController)
        {
            _featureController = featureController;
            _pageModel = new TripDetailPageDisplayModel
            {
                ReserveCommand       = featureController.ReserveCommand,
                CancelCommand        = featureController.CancelCommand,
                ConfirmCancelCommand = featureController.ConfirmCancelCommand,
                DismissCancelToastCommand = featureController.DismissCancelToastCommand,
            };

            // Synchroniser les sections depuis le feature controller
            _featureController.PropertyChanged += (_, e) =>
            {
                switch (e.PropertyName)
                {
                    case nameof(TripDetailDisplayController.SummaryCard):
                        _pageModel.SummaryCard = _featureController.SummaryCard;
                        break;
                    case nameof(TripDetailDisplayController.DeparturePoint):
                        _pageModel.DeparturePoint = _featureController.DeparturePoint;
                        break;
                    case nameof(TripDetailDisplayController.ArrivalPoint):
                        _pageModel.ArrivalPoint = _featureController.ArrivalPoint;
                        break;
                    case nameof(TripDetailDisplayController.PreferencesSection):
                        _pageModel.PreferencesSection = _featureController.PreferencesSection;
                        break;
                    case nameof(TripDetailDisplayController.StatusSection):
                        _pageModel.StatusSection = _featureController.StatusSection;
                        break;
                    case nameof(TripDetailDisplayController.ShowCancelToast):
                        _pageModel.ShowCancelToast = _featureController.ShowCancelToast;
                        break;
                }
            };
        }

        public string? TripId       { get => _tripId;       set { _tripId       = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? ViewerRole   { get => _viewerRole;   set { _viewerRole   = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? Source       { get => _source;       set { _source       = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? SourceStatus { get => _sourceStatus; set { _sourceStatus = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }

        private bool _loadScheduled;
        private void TryLoad()
        {
            if (string.IsNullOrWhiteSpace(_tripId) || _loadScheduled) return;
            _loadScheduled = true;
            // Micro-delay pour que toutes les QueryProperty soient settées
            _ = Task.Run(async () =>
            {
                await Task.Delay(50);
                await LoadAsync();
            });
        }

        private async Task LoadAsync()
        {
            _pageModel.IsLoading = true;
            try
            {
                // ── TODO : GET /api/trips/{_tripId} ──
                var trip = await Task.Run(() =>
                    TripViewDataFixtures.All.FirstOrDefault(t => t.Id == _tripId)
                    ?? TripViewDataFixtures.All.FirstOrDefault());

                if (trip is null) return;

                var role = _viewerRole switch
                {
                    "driver_owner" => TripViewerRole.DriverOwner,
                    "admin"        => TripViewerRole.Admin,
                    _              => TripViewerRole.Passenger,
                };

                // Injection des handlers API
                _featureController.OnReserve = async id =>
                {
                    // TODO : POST /api/reservations { tripId: id, passengerId: currentUser.id }
                    await Task.Delay(400);
                    return true;
                };
                _featureController.OnCancelReservation = async id =>
                {
                    // TODO : PATCH /api/reservations/{id} { status: "cancelled" }
                    await Task.Delay(300);
                    return true;
                };

                _featureController.Load(trip, role, existingReservation: null, _source, _sourceStatus);

                _pageModel.PageTitle = $"{trip.Departure.Label} → {trip.Arrival.Label}";
                _pageModel.CancelLabel = role == TripViewerRole.Passenger
                    ? "Annuler cette réservation"
                    : "Annuler ce trajet";

                // Bouton "Écrire un message" — visible si le trajet est en cours (accessible)
                _pageModel.ShowMessageButton  = _sourceStatus == "inprogress";
                _pageModel.ConversationTripId = _tripId ?? "";
            }
            finally
            {
                _pageModel.IsLoading = false;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
