using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views
{
    public partial class IncomingReservationRequestCard : ContentView
    {
        public static readonly BindableProperty ModelProperty =
            BindableProperty.Create(
                nameof(Model),
                typeof(IncomingReservationRequestCardDisplayModel),
                typeof(IncomingReservationRequestCard),
                propertyChanged: (b, _, n) =>
                {
                    if (b is IncomingReservationRequestCard card && n is IncomingReservationRequestCardDisplayModel m)
                    {
                        card.BindingContext = m;
                    }
                });

        public IncomingReservationRequestCardDisplayModel? Model
        {
            get => (IncomingReservationRequestCardDisplayModel?)GetValue(ModelProperty);
            set => SetValue(ModelProperty, value);
        }

        public event EventHandler? AcceptClicked;
        public event EventHandler? DeclineClicked;

        public IncomingReservationRequestCard()
        {
            InitializeComponent();
            AcceptButton.Clicked += (s, e) => AcceptClicked?.Invoke(this, e);
            DeclineButton.Clicked += (s, e) => DeclineClicked?.Invoke(this, e);
        }
    }
}
