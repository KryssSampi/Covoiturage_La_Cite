// ============================================================
//  Features/tripdetail/DisplayControler/TripDetailDisplayController.cs
//  Orchestre les 4 sections de la vue détail d'un trajet publié.
//  Nourri par TripDetailPageDisplayController.
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayControler
{
    public class TripDetailDisplayController : INotifyPropertyChanged
    {
        private TripSummaryCardDisplayModel? _summaryCard;
        private TripPointDisplayModel? _departurePoint;
        private TripPointDisplayModel? _arrivalPoint;
        private TripPreferencesSectionDisplayModel? _preferencesSection;
        private TripStatusSectionDisplayModel? _statusSection;
        private bool _isReserving;
        private bool _showCancelToast;

        public TripSummaryCardDisplayModel?        SummaryCard        { get => _summaryCard;        private set => SetField(ref _summaryCard, value); }
        public TripPointDisplayModel?              DeparturePoint     { get => _departurePoint;     private set => SetField(ref _departurePoint, value); }
        public TripPointDisplayModel?              ArrivalPoint       { get => _arrivalPoint;       private set => SetField(ref _arrivalPoint, value); }
        public TripPreferencesSectionDisplayModel? PreferencesSection { get => _preferencesSection; private set => SetField(ref _preferencesSection, value); }
        public TripStatusSectionDisplayModel?      StatusSection      { get => _statusSection;      private set => SetField(ref _statusSection, value); }
        public bool IsReserving   { get => _isReserving;   set => SetField(ref _isReserving, value); }
        public bool ShowCancelToast { get => _showCancelToast; set => SetField(ref _showCancelToast, value); }

        // Actions injectées par la page
        public Func<string, Task<bool>>? OnReserve { get; set; }
        public Func<string, Task<bool>>? OnCancelReservation { get; set; }
        public Func<string, Task<bool>>? OnCancelTrip { get; set; }

        public ICommand ReserveCommand { get; }
        public ICommand CancelCommand { get; }
        public ICommand ConfirmCancelCommand { get; }
        public ICommand DismissCancelToastCommand { get; }

        private TripViewData? _currentTrip;

        public TripDetailDisplayController()
        {
            ReserveCommand = new Command(async () =>
            {
                if (_currentTrip is null || IsReserving) return;
                IsReserving = true;
                try { await (OnReserve?.Invoke(_currentTrip.Id) ?? Task.FromResult(false)); }
                finally { IsReserving = false; }
            });

            CancelCommand = new Command(() => ShowCancelToast = true);

            ConfirmCancelCommand = new Command(async () =>
            {
                ShowCancelToast = false;
                if (_currentTrip is null) return;
                await (OnCancelReservation?.Invoke(_currentTrip.Id) ?? Task.FromResult(false));
            });

            DismissCancelToastCommand = new Command(() => ShowCancelToast = false);
        }

        public void Load(
            TripViewData trip,
            TripViewerRole viewerRole,
            ExistingReservationInfo? existingReservation,
            string? source,
            string? sourceStatus)
        {
            _currentTrip = trip;

            SummaryCard        = TripDetailDisplayConverter.ToSummaryCard(trip, viewerRole, existingReservation, source, sourceStatus);
            DeparturePoint     = TripDetailDisplayConverter.ToPointDisplayModel(trip.Departure, isDeparture: true);
            ArrivalPoint       = TripDetailDisplayConverter.ToPointDisplayModel(trip.Arrival,   isDeparture: false);
            PreferencesSection = TripDetailDisplayConverter.ToPreferencesSection(trip.Preferences);
            StatusSection      = TripDetailDisplayConverter.ToStatusSection(trip.Status);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value; OnPropertyChanged(name); return true;
        }
    }
}
