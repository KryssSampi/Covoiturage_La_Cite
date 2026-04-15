// ============================================================
//  Features/tripdetail/DisplayModels/TripDetailDisplayModels.cs
//  DisplayModels de la feature TripDetail
//  Miroir de PublishedTripView (web) — sections :
//   - TripSummaryCardDisplayModel    : conducteur, tarif, bouton réserver/gérer
//   - TripPointDisplayModel          : un point (départ ou arrivée)
//   - TripPreferencesSectionDisplayModel : préférences + note conducteur
//   - TripStatusSectionDisplayModel  : statut, paiement, places
//   - ReserveButtonDisplayModel      : état du bouton action
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayModels
{
    // ── État bouton réserver (ReserveButtonState mobile) ─────
    public enum ReserveButtonKind
    {
        Reserve, Pending, Confirmed, Refused, Cooldown, Full,
        Manage, Readonly,
        ReservationConfirmed, ReservationInProgress, ReservationCancelled,
        ReservationPending, ReservationCompleted, ReservationRejected,
        ReservationImminent,
        TripPublished, TripFull, TripConfirmed, TripInProgress,
        TripCompleted, TripCancelled, TripNoShow, TripImminent
    }

    public record ReserveButtonDisplayModel(
        ReserveButtonKind Kind,
        string Label,
        string BackgroundHex,
        string TextColorHex,
        bool IsEnabled
    );

    // ── Carte résumé (conducteur + tarif + bouton) ───────────
    public partial class TripSummaryCardDisplayModel : INotifyPropertyChanged
    {
        private string _driverFirstName = "";
        private string? _driverAvatarUrl;
        private double _driverRating;
        private int _driverTripCount;
        private string _vehicleLabel = "";
        private string _vehicleColor = "";
        private string _departureDate = "";
        private string _departureTime = "";
        private int _estimatedDurationMin;
        private double _estimatedDistanceKm;
        private double _displayPrice;       // passengerPrice ou pricePerPassenger selon le rôle
        private int _availableSeats;
        private int _totalSeats;
        private string _paymentMethodLabel = "";
        private ReserveButtonDisplayModel? _reserveButton;
        private bool _showCancelButton;
        private string _cancelLabel = "";
        private bool _isDriver;

        public string DriverFirstName { get => _driverFirstName; set => SetField(ref _driverFirstName, value); }
        public string? DriverAvatarUrl { get => _driverAvatarUrl; set => SetField(ref _driverAvatarUrl, value); }
        public double DriverRating { get => _driverRating; set => SetField(ref _driverRating, value); }
        public int DriverTripCount { get => _driverTripCount; set => SetField(ref _driverTripCount, value); }
        public string VehicleLabel { get => _vehicleLabel; set => SetField(ref _vehicleLabel, value); }
        public string VehicleColor { get => _vehicleColor; set => SetField(ref _vehicleColor, value); }
        public string DepartureDate { get => _departureDate; set => SetField(ref _departureDate, value); }
        public string DepartureTime { get => _departureTime; set => SetField(ref _departureTime, value); }
        public int EstimatedDurationMin { get => _estimatedDurationMin; set => SetField(ref _estimatedDurationMin, value); }
        public double EstimatedDistanceKm { get => _estimatedDistanceKm; set => SetField(ref _estimatedDistanceKm, value); }
        public double DisplayPrice
        {
            get => _displayPrice;
            set
            {
                if (SetField(ref _displayPrice, value))
                {
                    OnPropertyChanged(nameof(PriceLabel));
                }
            }
        }
        public int AvailableSeats
        {
            get => _availableSeats;
            set
            {
                if (SetField(ref _availableSeats, value))
                {
                    OnPropertyChanged(nameof(SeatsLabel));
                }
            }
        }
        public int TotalSeats
        {
            get => _totalSeats;
            set
            {
                if (SetField(ref _totalSeats, value))
                {
                    OnPropertyChanged(nameof(SeatsLabel));
                }
            }
        }
        public string PaymentMethodLabel { get => _paymentMethodLabel; set => SetField(ref _paymentMethodLabel, value); }
        public ReserveButtonDisplayModel? ReserveButton { get => _reserveButton; set => SetField(ref _reserveButton, value); }
        public bool ShowCancelButton { get => _showCancelButton; set => SetField(ref _showCancelButton, value); }
        public string CancelLabel { get => _cancelLabel; set => SetField(ref _cancelLabel, value); }
        public bool IsDriver { get => _isDriver; set => SetField(ref _isDriver, value); }

        public string PriceLabel => $"{DisplayPrice:F2} $";
        public string SeatsLabel => $"{AvailableSeats}/{TotalSeats} place{(TotalSeats > 1 ? "s" : "")}";
        public string DurationLabel => $"{EstimatedDurationMin} min";
        public string DistanceLabel => $"{EstimatedDistanceKm:F1} km";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }

    // ── Section point (départ ou arrivée) ────────────────────
    public partial class TripPointDisplayModel : INotifyPropertyChanged
    {
        private bool _isDeparture;
        private string _label = "";
        private string _fullAddress = "";
        private string? _instructions;
        private double? _lat;
        private double? _lng;
        private bool _hasInstructions;

        public bool IsDeparture { get => _isDeparture; set => SetField(ref _isDeparture, value); }
        public string Label { get => _label; set => SetField(ref _label, value); }
        public string FullAddress { get => _fullAddress; set => SetField(ref _fullAddress, value); }
        public string? Instructions
        {
            get => _instructions;
            set
            {
                if (SetField(ref _instructions, value))
                {
                    OnPropertyChanged(nameof(HasInstructions));
                }
            }
        }
        public double? Lat { get => _lat; set => SetField(ref _lat, value); }
        public double? Lng { get => _lng; set => SetField(ref _lng, value); }
        public bool HasCoords => Lat.HasValue && Lng.HasValue;
        public bool HasInstructions => !string.IsNullOrWhiteSpace(Instructions);
        public string TypeLabel => IsDeparture ? "Départ" : "Arrivée";
        public string DotColor => IsDeparture ? "#08316e" : "#e04a2f";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }

    // ── Section préférences ────────────────────────────────────
    public record TripPreferenceItem(string IconKey, string Label, bool Value);

    public partial class TripPreferencesSectionDisplayModel : INotifyPropertyChanged
    {
        private IReadOnlyList<TripPreferenceItem> _items = Array.Empty<TripPreferenceItem>();
        private string? _driverNote;

        public IReadOnlyList<TripPreferenceItem> Items { get => _items; set => SetField(ref _items, value); }
        public string? DriverNote
        {
            get => _driverNote;
            set
            {
                if (SetField(ref _driverNote, value))
                {
                    OnPropertyChanged(nameof(HasDriverNote));
                }
            }
        }
        public bool HasDriverNote => !string.IsNullOrWhiteSpace(DriverNote);

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }

    // ── Section statut ─────────────────────────────────────────
    public partial class TripStatusSectionDisplayModel : INotifyPropertyChanged
    {
        private string _tripTypeLabel = "";
        private bool _isRecurrent;
        private string? _maxDetourLabel;
        private string _lastUpdated = "";

        public string TripTypeLabel { get => _tripTypeLabel; set => SetField(ref _tripTypeLabel, value); }
        public bool IsRecurrent { get => _isRecurrent; set => SetField(ref _isRecurrent, value); }
        public string? MaxDetourLabel { get => _maxDetourLabel; set => SetField(ref _maxDetourLabel, value); }
        public string LastUpdated { get => _lastUpdated; set => SetField(ref _lastUpdated, value); }
        public bool HasDetour => MaxDetourLabel is not null;

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }
}
