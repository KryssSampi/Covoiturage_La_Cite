namespace Covoiturage_la_cite__App_Mobile_.Features.favoris.Views.Components
{
    public partial class FavoritePlaceCard : ContentView
    {
        public event EventHandler<string>? DeleteRequested;

        public FavoritePlaceCard() => InitializeComponent();

        private void OnDeleteTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is DisplayModels.FavoriteCardDisplayModel m)
                DeleteRequested?.Invoke(this, m.Id);
        }
    }
}
