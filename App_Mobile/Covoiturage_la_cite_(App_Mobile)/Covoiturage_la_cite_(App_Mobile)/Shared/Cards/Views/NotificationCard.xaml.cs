using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views
{
    public partial class NotificationCard : ContentView
    {
        public static readonly BindableProperty ModelProperty =
            BindableProperty.Create(
                nameof(Model),
                typeof(NotificationCardDisplayModel),
                typeof(NotificationCard),
                propertyChanged: (b, _, n) =>
                {
                    if (b is NotificationCard card && n is NotificationCardDisplayModel m)
                    {
                        card.BindingContext = m;
                        card.ApplyType(m);
                    }
                });

        public NotificationCardDisplayModel? Model
        {
            get => (NotificationCardDisplayModel?)GetValue(ModelProperty);
            set => SetValue(ModelProperty, value);
        }

        public event EventHandler? PrimaryActionClicked;
        public event EventHandler? DeclineClicked;

        public NotificationCard()
        {
            InitializeComponent();
            PrimaryActionButton.Clicked += (s, e) => PrimaryActionClicked?.Invoke(this, e);
            DeclineButton.Clicked += (s, e) => DeclineClicked?.Invoke(this, e);
        }

        private void ApplyType(NotificationCardDisplayModel m)
        {
            (TypeLabel.Text, TypeLabel.TextColor) = m.Type switch
            {
                NotificationType.NewRequest => ("Nouvelle demande", Color.FromArgb("#1A56CC")),
                NotificationType.Confirmed  => ("Confirmée",        Color.FromArgb("#0F6E56")),
                NotificationType.Reminder   => ("Rappel",           Color.FromArgb("#854F0B")),
                NotificationType.Info       => ("Information",      Color.FromArgb("#1A56CC")),
                NotificationType.Cancelled  => ("Annulation",       Color.FromArgb("#A32D2D")),
                _                           => ("",                 Colors.Transparent),
            };
        }
    }
}
