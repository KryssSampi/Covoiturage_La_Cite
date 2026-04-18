// ============================================================
//  App/Mobilepages/historiquepage/view/HistoriquePage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.historiquepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.historiquepage.view
{
public partial class HistoriquePage : ContentPage
{
    private readonly HistoriquePageDisplayController _controller;

    public HistoriquePage(HistoriquePageDisplayController controller)
    {
        InitializeComponent();
        _controller = controller;
        BindingContext = _controller;
        HistList.SetController(_controller.ListController);
    }

    private async void OnHistoryCardTapped(object sender, TappedEventArgs e)
    {
        if (sender is VisualElement ve && ve.BindingContext is HistoriqueCardDisplayModel card)
        {
            _controller.HandleCardTap(card);
        }
    }
}
}

