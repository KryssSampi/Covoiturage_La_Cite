// App/Mobilepages/tripdetailpage/view/TripDetailPage.xaml.cs

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.view
{
    public partial class TripDetailPage : ContentPage
    {
        private readonly TripDetailPageDisplayController _controller;

        public TripDetailPage(TripDetailPageDisplayController controller)
        {
            InitializeComponent();
            _controller = controller;
            BindingContext = controller.PageModel;
        }

        private async void OnWriteMessageTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is TripDetailPageDisplayModel m && !string.IsNullOrEmpty(m.ConversationTripId))
            {
                var tripId = Uri.EscapeDataString(m.ConversationTripId);
                await Shell.Current.GoToAsync($"conversation?tripId={tripId}");
            }
        }
    }
}
