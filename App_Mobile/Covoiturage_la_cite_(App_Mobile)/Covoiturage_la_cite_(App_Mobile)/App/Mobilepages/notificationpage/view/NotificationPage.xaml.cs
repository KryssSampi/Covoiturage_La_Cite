// ============================================================
//  App/Mobilepages/notificationpage/view/NotificationPage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationpage.view
{
    public partial class NotificationPage : ContentView
    {
        private readonly NotificationsListDisplayController _listController;

        public NotificationPage(UserViewModel userViewModel)
        {
            InitializeComponent();

            var canBeDriver = userViewModel.Role == UserRole.Driver;
            _listController = new NotificationsListDisplayController(canBeDriver);

            // Navigation : tap sur une carte → detail page
            _listController.OnCardTap = async card =>
            {
                var id = Uri.EscapeDataString(card.Id);
                await Shell.Current.GoToAsync($"notificationdetail?notificationId={id}");
            };

            NotifList.SetController(_listController.ListController);
        }

        private void OnNotificationCardTapped(object sender, TappedEventArgs e)
        {
            if (sender is VisualElement ve && ve.BindingContext is NotificationCardDisplayModel card)
                _listController.HandleCardTap(card);
        }
    }
}
