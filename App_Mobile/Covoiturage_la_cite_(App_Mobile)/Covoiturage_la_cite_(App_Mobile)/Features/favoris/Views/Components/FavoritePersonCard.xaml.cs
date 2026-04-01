namespace Covoiturage_la_cite__App_Mobile_.Features.favoris.Views.Components
{
    public partial class FavoritePersonCard : ContentView
    {
        public event EventHandler<string>? DeleteRequested;
        public event EventHandler<string>? MessageRequested;

        public FavoritePersonCard() => InitializeComponent();

        private void OnDeleteTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is DisplayModels.FavoriteCardDisplayModel m)
                DeleteRequested?.Invoke(this, m.Id);
        }

        private void OnMessageTapped(object sender, TappedEventArgs e)
        {
            if (BindingContext is DisplayModels.FavoriteCardDisplayModel m)
                MessageRequested?.Invoke(this, m.Id);
        }
    }
}
