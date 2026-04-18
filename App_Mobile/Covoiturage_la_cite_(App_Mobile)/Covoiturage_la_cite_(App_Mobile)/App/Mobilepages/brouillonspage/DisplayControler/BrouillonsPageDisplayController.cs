using Covoiturage_la_cite__App_Mobile_.Core.Interfaces;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.brouillonspage.DisplayControler
{
    public class BrouillonsPageDisplayController : ICoreListPageNeeds
    {
        public UserViewModel UserViewModel { get; }

        public ItemListController<BrouillonCardDisplayModel> ListController { get; }

        private readonly BrouillonsListDisplayController _listCtrl;

        public BrouillonsPageDisplayController(UserViewModel userViewModel)
        {
            UserViewModel = userViewModel;

            // Glue: Create list controller (move logic from view)
            _listCtrl = new BrouillonsListDisplayController();
            _listCtrl.OnCardTap = card => NavigateToDraft(card);
            ListController = _listCtrl.ListController;
        }

        private async void NavigateToDraft(BrouillonCardDisplayModel card)
        {
            // Original navigation logic
            var driverId = Uri.EscapeDataString(UserViewModel.FirstName); // TODO: real driverId
            var form = BrouillonsFixtures.FormStateById(card.Id);
            if (form is null)
            {
                await Shell.Current.GoToAsync($"createtrip?driverId={driverId}");
                return;
            }

            var dep  = Uri.EscapeDataString(form.DepartureLocation ?? "");
            var arr  = Uri.EscapeDataString(form.ArrivalLocation ?? "");
            var date = Uri.EscapeDataString(form.DepartureDate ?? "");
            var time = Uri.EscapeDataString(form.DepartureTime ?? "");

            await Shell.Current.GoToAsync(
                $"createtrip?driverId={driverId}&departure={dep}&arrival={arr}&date={date}&time={time}");
        }

        public void HandleCardTap(BrouillonCardDisplayModel card) => _listCtrl.HandleCardTap(card);
    }
}

