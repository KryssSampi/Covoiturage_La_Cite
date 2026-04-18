// ============================================================
//  App/Mobilepages/notificationpage/view/NotificationPage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationpage.view
{
public partial class NotificationPage : ContentView
{
    private readonly NotificationPageDisplayController _controller;

    public NotificationPage(NotificationPageDisplayController controller)
    {
        InitializeComponent();
        _controller = controller;
        BindingContext = _controller;
        NotifList.SetController(_controller.ListController);
    }

    private async void OnNotificationCardTapped(object sender, TappedEventArgs e)
    {
        if (sender is VisualElement ve && ve.BindingContext is NotificationCardDisplayModel card)
        {
            _controller.HandleCardTap(card);
        }
    }
}
}


