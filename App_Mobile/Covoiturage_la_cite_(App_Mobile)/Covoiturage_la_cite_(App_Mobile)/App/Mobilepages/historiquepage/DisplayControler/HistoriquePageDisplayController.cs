using Covoiturage_la_cite__App_Mobile_.Core.Interfaces;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.historiquepage.DisplayControler
{
    public class HistoriquePageDisplayController : ICoreListPageNeeds
    {
        public UserViewModel UserViewModel { get; }

        public ItemListController<HistoriqueCardDisplayModel> ListController { get; }

        private readonly HistoriqueListDisplayController _listCtrl;

        public HistoriquePageDisplayController(UserViewModel userViewModel)
        {
            UserViewModel = userViewModel;

            // Load fixtures/data based on role (glue logic moved here)
            bool canBeDriver = userViewModel.Role == UserRole.Driver;
            _listCtrl = new HistoriqueListDisplayController(canBeDriver);
            _listCtrl.OnCardTap = card => NavigateToHistoryDetail(card);
            ListController = _listCtrl.ListController;
        }

        private async void NavigateToHistoryDetail(HistoriqueCardDisplayModel card)
        {
            if (string.IsNullOrEmpty(card.TripId)) return;

            var tripId = Uri.EscapeDataString(card.TripId);
            var role   = card.Role == HistoriqueRole.Driver ? "driver_owner" : "passenger";
            await Shell.Current.GoToAsync(
                $"tripdetail?tripId={tripId}&viewerRole={role}&source=historique");
        }

        public void HandleCardTap(HistoriqueCardDisplayModel card) => _listCtrl.HandleCardTap(card);
    }
}

