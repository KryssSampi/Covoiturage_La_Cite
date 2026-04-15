// ============================================================
//  App/Mobilepages/tripdetailpage/DisplayModels/
//  TripDetailPageDisplayModel.cs
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.tripdetailpage.DisplayModels
{
    public class TripDetailPageDisplayModel : INotifyPropertyChanged
    {
        private bool _isLoading = true;
        private string _pageTitle = "Trajet";

        // Sections de la feature (alimentées par TripDetailPageDisplayController)
        private TripSummaryCardDisplayModel?        _summaryCard;
        private TripPointDisplayModel?              _departurePoint;
        private TripPointDisplayModel?              _arrivalPoint;
        private TripPreferencesSectionDisplayModel? _preferencesSection;
        private TripStatusSectionDisplayModel?      _statusSection;
        private bool _showCancelToast;
        private string _cancelLabel = "";
        private bool _isReserving;
        private bool _showMessageButton;
        private string _conversationTripId = "";

        public bool   IsLoading    { get => _isLoading;   set => SetField(ref _isLoading, value); }
        public string PageTitle    { get => _pageTitle;   set => SetField(ref _pageTitle, value); }
        public bool   ShowCancelToast { get => _showCancelToast; set => SetField(ref _showCancelToast, value); }
        public string CancelLabel  { get => _cancelLabel; set => SetField(ref _cancelLabel, value); }
        public bool   IsReserving        { get => _isReserving;        set => SetField(ref _isReserving, value); }
        public bool   ShowMessageButton  { get => _showMessageButton;  set => SetField(ref _showMessageButton, value); }
        public string ConversationTripId { get => _conversationTripId; set => SetField(ref _conversationTripId, value); }

        public TripSummaryCardDisplayModel?        SummaryCard        { get => _summaryCard;        set => SetField(ref _summaryCard, value); }
        public TripPointDisplayModel?              DeparturePoint     { get => _departurePoint;     set => SetField(ref _departurePoint, value); }
        public TripPointDisplayModel?              ArrivalPoint       { get => _arrivalPoint;       set => SetField(ref _arrivalPoint, value); }
        public TripPreferencesSectionDisplayModel? PreferencesSection { get => _preferencesSection; set => SetField(ref _preferencesSection, value); }
        public TripStatusSectionDisplayModel?      StatusSection      { get => _statusSection;      set => SetField(ref _statusSection, value); }

        // Commandes (déléguées depuis le feature controller)
        public ICommand? ReserveCommand       { get; set; }
        public ICommand? CancelCommand        { get; set; }
        public ICommand? ConfirmCancelCommand { get; set; }
        public ICommand? DismissCancelToastCommand { get; set; }

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
