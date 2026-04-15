// App/Mobilepages/reservationrequestdetailpage/view/ReservationRequestDetailPage.xaml.cs

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.view
{
    public partial class ReservationRequestDetailPage : ContentPage
    {
        private readonly ReservationRequestDetailPageDisplayController _controller;

        public ReservationRequestDetailPage(ReservationRequestDetailPageDisplayController controller)
        {
            InitializeComponent();
            _controller = controller;
            BindingContext = controller.PageModel;
        }
    }
}
