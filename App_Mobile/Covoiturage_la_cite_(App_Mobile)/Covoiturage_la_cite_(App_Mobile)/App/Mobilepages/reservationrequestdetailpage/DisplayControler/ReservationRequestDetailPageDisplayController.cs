// ============================================================
//  App/Mobilepages/reservationrequestdetailpage/DisplayControler/
//  ReservationRequestDetailPageDisplayController.cs
//
//  Orchestre la page ReservationRequestDetailPage :
//   - Reçoit le requestId via Shell QueryProperty
//   - Charge la ReservationRequestModel (fixtures → TODO API)
//   - Nourrit ReservationRequestDisplayController (feature)
//   - Injecte les handlers accept/reject (→ TODO API)
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.DisplayControler
{
    [QueryProperty(nameof(RequestId), "requestId")]
    public class ReservationRequestDetailPageDisplayController : INotifyPropertyChanged
    {
        private readonly ReservationRequestDisplayController _featureController;
        private readonly ReservationRequestDetailPageDisplayModel _pageModel;
        private string? _requestId;

        public ReservationRequestDetailPageDisplayModel PageModel => _pageModel;

        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        public ReservationRequestDetailPageDisplayController(
            ReservationRequestDisplayController featureController)
        {
            _featureController = featureController;
            _pageModel = new ReservationRequestDetailPageDisplayModel
            {
                RequestAcceptCommand  = featureController.RequestAcceptCommand,
                RequestRejectCommand  = featureController.RequestRejectCommand,
                ConfirmDecisionCommand = featureController.ConfirmDecisionCommand,
                CancelDecisionCommand = featureController.CancelDecisionCommand,
            };

            _featureController.PropertyChanged += (_, e) =>
            {
                if (e.PropertyName == nameof(ReservationRequestDisplayController.Detail))
                    _pageModel.RequestDetail = _featureController.Detail;
            };
        }

        public string? RequestId
        {
            get => _requestId;
            set
            {
                _requestId = Uri.UnescapeDataString(value ?? "");
                _ = LoadAsync(_requestId);
            }
        }

        private async Task LoadAsync(string id)
        {
            _pageModel.IsLoading = true;
            try
            {
                // ── TODO : GET /api/driver/reservation-requests/{id} ──
                var request = await Task.Run(() =>
                    ReservationRequestFixtures.All.FirstOrDefault(r => r.Id == id)
                    ?? ReservationRequestFixtures.All.FirstOrDefault());

                if (request is null) return;

                // Injection des handlers API (mock pour l'instant)
                _featureController.OnAccept = async reqId =>
                {
                    // TODO : POST /api/reservations/{reqId}/accept
                    await Task.Delay(300);
                    return true;
                };
                _featureController.OnReject = async reqId =>
                {
                    // TODO : POST /api/reservations/{reqId}/reject
                    await Task.Delay(300);
                    return true;
                };

                _featureController.Load(request);
                _pageModel.PageTitle = $"Demande de {request.Applicant.Name}";
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
