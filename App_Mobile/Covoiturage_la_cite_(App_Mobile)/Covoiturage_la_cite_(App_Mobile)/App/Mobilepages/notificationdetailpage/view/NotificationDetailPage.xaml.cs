// App/Mobilepages/notificationdetailpage/view/NotificationDetailPage.xaml.cs
// Code-behind épuré — la logique est dans NotificationDetailPageDisplayController.

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.view
{
    public partial class NotificationDetailPage : ContentPage
    {
        private readonly NotificationDetailPageDisplayController _controller;

        public NotificationDetailPage(NotificationDetailPageDisplayController controller)
        {
            InitializeComponent();
            _controller = controller;
            BindingContext = controller.PageModel;
        }
    }
}
