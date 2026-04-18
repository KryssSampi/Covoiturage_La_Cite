using Covoiturage_la_cite__App_Mobile_.Core.Interfaces;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationpage.DisplayControler
{
    public class NotificationPageDisplayController : ICoreListPageNeeds
    {
        public UserViewModel UserViewModel { get; }

        public ItemListController<NotificationCardDisplayModel> ListController { get; }

public NotificationPageDisplayController(UserViewModel userViewModel)
        {
            UserViewModel = userViewModel;

            bool canBeDriver = userViewModel.Role == UserRole.Driver;
            _listCtrl = new NotificationsListDisplayController(canBeDriver);
            _listCtrl.OnCardTap = card => NavigateToNotificationDetail(card);
            ListController = _listCtrl.ListController;
        }

        private readonly NotificationsListDisplayController _listCtrl;

        private async void NavigateToNotificationDetail(NotificationCardDisplayModel card)
        {
            await Shell.Current.GoToAsync($"notificationdetail?notificationId={Uri.EscapeDataString(card.Id)}");
        }

        public void HandleCardTap(NotificationCardDisplayModel card) => _listCtrl.HandleCardTap(card);
    }
}

