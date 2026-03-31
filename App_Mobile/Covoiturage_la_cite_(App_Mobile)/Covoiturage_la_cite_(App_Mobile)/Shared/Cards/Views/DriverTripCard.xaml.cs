using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views;

public partial class DriverTripCard : ContentView
{
    public static readonly BindableProperty ModelProperty =
        BindableProperty.Create(
            nameof(Model),
            typeof(DriverTripCardDisplayModel),
            typeof(DriverTripCard),
            propertyChanged: (b, _, n) =>
            {
                if (b is DriverTripCard card && n is DriverTripCardDisplayModel m)
                {
                    card.BindingContext = m;
                    card.ApplyState(m);
                }
            });

    public DriverTripCardDisplayModel? Model
    {
        get => (DriverTripCardDisplayModel?)GetValue(ModelProperty);
        set => SetValue(ModelProperty, value);
    }

    public event EventHandler? CancelClicked;

    public DriverTripCard()
    {
        InitializeComponent();
        CancelButton.Clicked += (s, e) => CancelClicked?.Invoke(this, e);
    }

    private void ApplyState(DriverTripCardDisplayModel m)
    {
        InProgressBanner.IsVisible = m.Status == DriverTripStatus.InProgress;
        ProgressBar.IsVisible      = m.Status == DriverTripStatus.InProgress;
        PendingBadge.IsVisible     = m.Status == DriverTripStatus.WithRequests;
        CancelButton.IsVisible     = m.Status is DriverTripStatus.Published
                                                or DriverTripStatus.WithRequests;

        (StatusLabel.Text, StatusLabel.TextColor) = m.Status switch
        {
            DriverTripStatus.Published     => ("• Publiee",   Color.FromArgb("#0F6E56")),
            DriverTripStatus.WithRequests  => ("• Publiee",   Color.FromArgb("#0F6E56")),
            DriverTripStatus.InProgress    => ("? En cours",  Color.FromArgb("#E24B4A")),
            DriverTripStatus.Completed     => ("? Terminee",  Color.FromArgb("#545D6E")),
            DriverTripStatus.Cancelled     => ("? Annulee",   Color.FromArgb("#A32D2D")),
            _                              => ("",            Colors.Transparent),
        };
    }
}
