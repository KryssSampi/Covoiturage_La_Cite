// ============================================================
//  App/Mobilepages/nouveautespage/view/NouveautesPage.xaml.cs
//  Charge les cartes NouveauteCard dynamiquement (WebView par carte).
// ============================================================

using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.nouveautes.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Features.nouveautes.Views.Components;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.nouveautespage.view
{
    public partial class NouveautesPage : ContentPage
    {
        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        private bool _isLoaded;

        public NouveautesPage()
        {
            InitializeComponent();
            BindingContext = this;
        }

        // ?????????????????????????????????????????????????????????????
        //  Chargement différé — WebViews créées après affichage
        // ?????????????????????????????????????????????????????????????
        protected override async void OnAppearing()
        {
            base.OnAppearing();
            if (_isLoaded) return;
            _isLoaded = true;

            // Charge les données hors UI thread
            var items = await Task.Run(() => NouveautesFixtures.All().ToList());

            // Crée les cartes sur le UI thread (nécessaire pour XAML)
            foreach (var model in items)
            {
                var card = new NouveauteCard { BindingContext = model };
                CardsStack.Children.Add(card);
            }
        }
    }
}
