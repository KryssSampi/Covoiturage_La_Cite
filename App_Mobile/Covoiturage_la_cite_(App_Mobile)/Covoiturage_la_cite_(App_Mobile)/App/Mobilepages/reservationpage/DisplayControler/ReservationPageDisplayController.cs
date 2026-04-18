using Covoiturage_la_cite__App_Mobile_.Core.Interfaces;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationpage.DisplayControler
{
    public class ReservationPageDisplayController : ICoreListPageNeeds
    {
        public UserViewModel UserViewModel { get; }

        public ItemListController<ReservationListCardDisplayModel> ListController { get; }

        public ReservationPageDisplayController(UserViewModel userViewModel)
        {
            UserViewModel = userViewModel;

            bool canBeDriver = userViewModel.Role == UserRole.Driver;
            _listCtrl = new ReservationsListDisplayController(canBeDriver);
            _listCtrl.OnCardTap = card => NavigateToReservationDetail(card);
            ListController = _listCtrl.ListController;
        }

        private readonly ReservationsListDisplayController _listCtrl;

        private async void NavigateToReservationDetail(ReservationListCardDisplayModel card)
        {
            var requestId = Uri.EscapeDataString(card.RequestId);
            await Shell.Current.GoToAsync($"reservationrequestdetail?requestId={requestId}");
        }

        public void HandleCardTap(ReservationListCardDisplayModel card) => _listCtrl.HandleCardTap(card);
    }
}

