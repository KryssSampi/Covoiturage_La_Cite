// ============================================================
//  Features/createtrip/DisplayModels/CreateTripDisplayModels.cs
//  DisplayModels du formulaire de création de trajet.
//  Miroir de CreateTripForm (web) — 5 sections :
//    BasicInfoSection, VehicleSection, PricingSection, PreferencesSection, MapPreviewSection
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.createtrip.DisplayModels
{
    // ── Item de sélecteur de véhicule ────────────────────────
    public record VehiclePickerItem(string Id, string Label, int MaxPassengers, string? Color);

    // ── Section informations de base ─────────────────────────
    public class BasicInfoSectionDisplayModel : INotifyPropertyChanged
    {
        private string _departureLocation = "";
        private string _arrivalLocation = "";
        private string? _departureInstructions;
        private string? _arrivalInstructions;
        private string _departureDate = "";
        private string _departureTime = "";
        private bool _isUnique = true;
        private string? _errorDeparture;
        private string? _errorArrival;
        private string? _errorDate;
        private string? _errorTime;

        public string DepartureLocation { get => _departureLocation; set => SetField(ref _departureLocation, value); }
        public string ArrivalLocation { get => _arrivalLocation; set => SetField(ref _arrivalLocation, value); }
        public string? DepartureInstructions { get => _departureInstructions; set => SetField(ref _departureInstructions, value); }
        public string? ArrivalInstructions { get => _arrivalInstructions; set => SetField(ref _arrivalInstructions, value); }
        public string DepartureDate { get => _departureDate; set => SetField(ref _departureDate, value); }
        public string DepartureTime { get => _departureTime; set => SetField(ref _departureTime, value); }
        public bool IsUnique { get => _isUnique; set => SetField(ref _isUnique, value); }
        public string? ErrorDeparture
        {
            get => _errorDeparture;
            set
            {
                SetField(ref _errorDeparture, value);
                OnPropertyChanged(nameof(HasErrorDeparture));
            }
        }
        public string? ErrorArrival
        {
            get => _errorArrival;
            set
            {
                SetField(ref _errorArrival, value);
                OnPropertyChanged(nameof(HasErrorArrival));
            }
        }
        public string? ErrorDate
        {
            get => _errorDate;
            set
            {
                SetField(ref _errorDate, value);
                OnPropertyChanged(nameof(HasErrorDate));
            }
        }
        public string? ErrorTime
        {
            get => _errorTime;
            set
            {
                SetField(ref _errorTime, value);
                OnPropertyChanged(nameof(HasErrorTime));
            }
        }

        public bool HasErrorDeparture => ErrorDeparture is not null;
        public bool HasErrorArrival => ErrorArrival is not null;
        public bool HasErrorDate => ErrorDate is not null;
        public bool HasErrorTime => ErrorTime is not null;
        public string TripTypeLabel => IsUnique ? "Unique" : "Récurrent";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }

    // ── Section véhicule + places ─────────────────────────────
    public class VehicleSectionDisplayModel : INotifyPropertyChanged
    {
        private IReadOnlyList<VehiclePickerItem> _vehicles = Array.Empty<VehiclePickerItem>();
        private VehiclePickerItem? _selectedVehicle;
        private int _availableSeats = 3;
        private string? _errorVehicle;

        public IReadOnlyList<VehiclePickerItem> Vehicles { get => _vehicles; set => SetField(ref _vehicles, value); }
        public VehiclePickerItem? SelectedVehicle
        {
            get => _selectedVehicle;
            set
            {
                SetField(ref _selectedVehicle, value);
                OnPropertyChanged(nameof(HasVehicle));
                OnPropertyChanged(nameof(MaxSeatsAllowed));
            }
        }
        public int AvailableSeats
        {
            get => _availableSeats;
            set
            {
                SetField(ref _availableSeats, value);
                OnPropertyChanged(nameof(SeatsLabel));
            }
        }
        public string? ErrorVehicle
        {
            get => _errorVehicle;
            set
            {
                SetField(ref _errorVehicle, value);
                OnPropertyChanged(nameof(HasErrorVehicle));
            }
        }

        public bool HasVehicle => SelectedVehicle is not null;
        public bool HasErrorVehicle => ErrorVehicle is not null;
        public int MaxSeatsAllowed => SelectedVehicle?.MaxPassengers ?? 4;
        public string SeatsLabel => $"{AvailableSeats} place{(AvailableSeats > 1 ? "s" : "")}";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }

    // ── Section tarification + préférences ───────────────────
    public class PricingSectionDisplayModel : INotifyPropertyChanged
    {
        private double _pricePerPassenger = 5.0;
        private bool _isCash = true;
        private bool _baggageAllowed;
        private bool _petsAllowed;
        private bool _smokingAllowed;
        private bool _musicAllowed;
        private bool _flexibleItinerary;
        private string? _driverNote;

        public double PricePerPassenger
        {
            get => _pricePerPassenger;
            set
            {
                SetField(ref _pricePerPassenger, value);
                OnPropertyChanged(nameof(PriceLabel));
                OnPropertyChanged(nameof(PassengerPriceLabel));
            }
        }
        public bool IsCash
        {
            get => _isCash;
            set => SetField(ref _isCash, value);
        }
        public bool BaggageAllowed { get => _baggageAllowed; set => SetField(ref _baggageAllowed, value); }
        public bool PetsAllowed { get => _petsAllowed; set => SetField(ref _petsAllowed, value); }
        public bool SmokingAllowed { get => _smokingAllowed; set => SetField(ref _smokingAllowed, value); }
        public bool MusicAllowed { get => _musicAllowed; set => SetField(ref _musicAllowed, value); }
        public bool FlexibleItinerary { get => _flexibleItinerary; set => SetField(ref _flexibleItinerary, value); }
        public string? DriverNote { get => _driverNote; set => SetField(ref _driverNote, value); }

        public string PriceLabel => $"{PricePerPassenger:F2} $";
        public string PassengerPriceLabel => $"{PricePerPassenger * 1.15:F2} $ (passager)";
        public string PaymentMethodLabel => IsCash ? "En espèces" : "Interac";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }

    // ── Toast résultat publication / brouillon ───────────────
    public class TripToastDisplayModel : INotifyPropertyChanged
    {
        private bool _isOpen;
        private bool _isSuccess;
        private string _title = "";
        private string _message = "";
        private string _okLabel = "Fermer";

        public bool IsOpen { get => _isOpen; set => SetField(ref _isOpen, value); }
        public bool IsSuccess { get => _isSuccess; set => SetField(ref _isSuccess, value); }
        public string Title { get => _title; set => SetField(ref _title, value); }
        public string Message { get => _message; set => SetField(ref _message, value); }
        public string OkLabel { get => _okLabel; set => SetField(ref _okLabel, value); }

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
