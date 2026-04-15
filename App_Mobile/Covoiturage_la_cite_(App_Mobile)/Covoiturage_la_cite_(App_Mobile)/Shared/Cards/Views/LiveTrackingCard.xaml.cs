using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views
{
    public partial class LiveTrackingCard : ContentView
    {
        public static readonly BindableProperty ModelProperty =
            BindableProperty.Create(
                nameof(Model),
                typeof(LiveTrackingCardDisplayModel),
                typeof(LiveTrackingCard),
                propertyChanged: (b, _, n) =>
                {
                    if (b is LiveTrackingCard card && n is LiveTrackingCardDisplayModel m)
                    {
                        card.BindingContext = m;
                        card.MapImage.Source = m.MapImageSource;
                    }
                });

        public LiveTrackingCardDisplayModel? Model
        {
            get => (LiveTrackingCardDisplayModel?)GetValue(ModelProperty);
            set => SetValue(ModelProperty, value);
        }

        public event EventHandler? SosClicked;
        public event EventHandler? ChatClicked;
        public event EventHandler? TrackClicked;

        public LiveTrackingCard()
        {
            InitializeComponent();
            SosButton.Clicked += (s, e) => SosClicked?.Invoke(this, e);
            ChatButton.Clicked += (s, e) => ChatClicked?.Invoke(this, e);
            TrackButton.Clicked += (s, e) => TrackClicked?.Invoke(this, e);
        }
    }
}
