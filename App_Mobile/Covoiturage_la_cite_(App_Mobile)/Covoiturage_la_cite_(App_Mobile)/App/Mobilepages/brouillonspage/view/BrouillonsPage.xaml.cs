// ============================================================
//  App/Mobilepages/brouillonspage/view/BrouillonsPage.xaml.cs
//  Tap → CreateTripPage pré-remplie avec les données du brouillon.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.brouillonspage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.brouillonspage.view
{
public partial class BrouillonsPage : ContentPage
{
    private readonly BrouillonsPageDisplayController _controller;

    public BrouillonsPage(BrouillonsPageDisplayController controller)
    {
        InitializeComponent();
        _controller = controller;
        BindingContext = _controller;
        BrouillonsList.SetController(_controller.ListController);
    }

    private async void OnBrouillonCardTapped(object sender, TappedEventArgs e)
    {
        if (sender is VisualElement ve && ve.BindingContext is BrouillonCardDisplayModel card)
        {
            _controller.HandleCardTap(card);
        }
    }
}
}

