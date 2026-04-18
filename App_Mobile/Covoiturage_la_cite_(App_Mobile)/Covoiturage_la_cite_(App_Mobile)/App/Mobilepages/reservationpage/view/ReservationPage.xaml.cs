// ============================================================
//  App/Mobilepages/reservationpage/view/ReservationPage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationpage.view
{
public partial class ReservationPage : ContentView
{
    private readonly ReservationPageDisplayController _controller;

    public ReservationPage(ReservationPageDisplayController controller)
    {
        InitializeComponent();
        _controller = controller;
        BindingContext = _controller;
        ReservationList.SetController(_controller.ListController);
    }

    private async void OnReservationCardTapped(object sender, TappedEventArgs e)
    {
        if (sender is VisualElement ve && ve.BindingContext is ReservationListCardDisplayModel card)
        {
            _controller.HandleCardTap(card);
        }
    }
}
}

