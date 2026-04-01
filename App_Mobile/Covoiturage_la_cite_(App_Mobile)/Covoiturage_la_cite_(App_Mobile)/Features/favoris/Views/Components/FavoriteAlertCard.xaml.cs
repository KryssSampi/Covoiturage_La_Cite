namespace Covoiturage_la_cite__App_Mobile_.Features.favoris.Views.Components
{
    public partial class FavoriteAlertCard : ContentView
    {
        public event EventHandler<string>? DeleteRequested;
        public event EventHandler<string>? SearchRequested;
        public event EventHandler<string>? ToggleRequested;

        public FavoriteAlertCard() => InitializeComponent();

        private void OnDeleteTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is DisplayModels.FavoriteCardDisplayModel m)
                DeleteRequested?.Invoke(this, m.Id);
        }

        private void OnSearchTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is DisplayModels.FavoriteCardDisplayModel m)
                SearchRequested?.Invoke(this, m.Id);
        }

        private void OnToggleTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is DisplayModels.FavoriteCardDisplayModel m)
                ToggleRequested?.Invoke(this, m.Id);
        }
    }
}
