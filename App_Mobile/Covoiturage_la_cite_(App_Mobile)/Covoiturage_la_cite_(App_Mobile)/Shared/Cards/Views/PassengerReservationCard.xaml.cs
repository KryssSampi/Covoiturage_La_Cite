using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views;

public partial class PassengerReservationCard : ContentView
{
    public static readonly BindableProperty ModelProperty =
        BindableProperty.Create(
            nameof(Model),
            typeof(PassengerReservationCardDisplayModel),
            typeof(PassengerReservationCard),
            propertyChanged: (b, _, n) =>
            {
                if (b is PassengerReservationCard card && n is PassengerReservationCardDisplayModel m)
                {
                    card.BindingContext = m;
                    card.ApplyState(m);
                }
            });

    public PassengerReservationCardDisplayModel? Model
    {
        get => (PassengerReservationCardDisplayModel?)GetValue(ModelProperty);
        set => SetValue(ModelProperty, value);
    }

    public event EventHandler? CancelClicked;
    public event EventHandler? MessageClicked;
    public event EventHandler? TrackClicked;
    public event EventHandler? RateClicked;

    public PassengerReservationCard()
    {
        InitializeComponent();
        CancelButton.Clicked  += (s, e) => CancelClicked?.Invoke(this, e);
        MessageButton.Clicked += (s, e) => MessageClicked?.Invoke(this, e);
        TrackButton.Clicked   += (s, e) => TrackClicked?.Invoke(this, e);
        RateButton.Clicked    += (s, e) => RateClicked?.Invoke(this, e);
    }

    private void ApplyState(PassengerReservationCardDisplayModel m)
    {
        ConfirmedBanner.IsVisible  = m.Status == PassengerReservationStatus.Confirmed;
        InProgressBanner.IsVisible = m.Status == PassengerReservationStatus.InProgress;
        VehicleInfo.IsVisible      = m.Status == PassengerReservationStatus.InProgress;
        MessageButton.IsVisible    = m.Status == PassengerReservationStatus.Confirmed;
        CancelButton.IsVisible     = m.Status is PassengerReservationStatus.Pending
                                                or PassengerReservationStatus.Confirmed;
        TrackButton.IsVisible      = m.Status == PassengerReservationStatus.InProgress;
        RateButton.IsVisible       = m.Status == PassengerReservationStatus.Completed && m.CanRate;

        (StatusBadgeLabel.Text, StatusBadgeLabel.TextColor) = m.Status switch
        {
            PassengerReservationStatus.Pending    => ("• En attente", Color.FromArgb("#854F0B")),
            PassengerReservationStatus.Confirmed  => ("? Confirmee",  Color.FromArgb("#0F6E56")),
            PassengerReservationStatus.InProgress => ("? En cours",   Color.FromArgb("#E24B4A")),
            PassengerReservationStatus.Completed  => ("? Terminee",   Color.FromArgb("#545D6E")),
            PassengerReservationStatus.Refused    => ("? Refusee",    Color.FromArgb("#A32D2D")),
            _                                     => ("",             Colors.Transparent),
        };
    }
}
