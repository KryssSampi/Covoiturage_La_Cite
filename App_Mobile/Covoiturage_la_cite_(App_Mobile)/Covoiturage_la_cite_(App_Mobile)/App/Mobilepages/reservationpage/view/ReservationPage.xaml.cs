// ============================================================
//  App/Mobilepages/reservationpage/view/ReservationPage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationpage.view
{
    public partial class ReservationPage : ContentView
    {
        private readonly ReservationsListDisplayController _listController;

        public ReservationPage(UserViewModel userViewModel)
        {
            InitializeComponent();

            var canBeDriver = userViewModel.Role == UserRole.Driver;
            _listController = new ReservationsListDisplayController(canBeDriver);

            // Navigation selon le rôle de la carte
            _listController.OnCardTap = async card =>
            {
                if (card.Role == ReservationCardRole.Driver)
                {
                    // → page détail de la demande (conducteur accepte / refuse)
                    var requestId = Uri.EscapeDataString(card.RequestId);
                    await Shell.Current.GoToAsync($"reservationrequestdetail?requestId={requestId}");
                }
                else
                {
                    // → page détail du trajet (vue passager)
                    var tripId = Uri.EscapeDataString(card.TripId);
                    await Shell.Current.GoToAsync(
                        $"tripdetail?tripId={tripId}&viewerRole=passenger");
                }
            };

            ReservationList.SetController(_listController.ListController);
        }

        private void OnReservationCardTapped(object sender, TappedEventArgs e)
        {
            if (sender is VisualElement ve && ve.BindingContext is ReservationListCardDisplayModel card)
                _listController.HandleCardTap(card);
        }
    }
}
