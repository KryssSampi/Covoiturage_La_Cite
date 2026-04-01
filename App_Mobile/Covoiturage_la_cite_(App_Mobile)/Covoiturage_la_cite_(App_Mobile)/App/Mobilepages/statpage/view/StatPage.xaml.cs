// App/Mobilepages/statpage/view/StatPage.xaml.cs

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.statpage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.statpage.view
{
    public partial class StatPage : ContentView
    {
        private readonly StatsPageController _controller;

        public StatPage(StatsPageController controller)
        {
            InitializeComponent();
            _controller    = controller;
            BindingContext = controller;
        }

        // Appelée par MainView quand l'onglet devient visible
        public async Task OnActivatedAsync()
        {
            if (_controller.IsLoading)
                await _controller.LoadAllAsync();
        }
    }
}
