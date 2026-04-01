// ============================================================
//  Features/reservationrequest/DisplayModels/
//  ReservationRequestDisplayModels.cs
//
//  DisplayModel de la vue détail d'une demande de réservation.
//  Mirrore FakeProfileDetail (web) :
//   - En-tête profil passager (avatar, nom, étoiles, nb trajets)
//   - Badges de vérification
//   - Bio (fictive)
//   - Détails du trajet demandé
//   - Boutons accepter / refuser + résultat
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels
{
    public enum ReservationDecisionState { None, Accepted, Rejected, Error }

    public class ReservationRequestDetailDisplayModel : INotifyPropertyChanged
    {
        // ── Profil passager ──────────────────────────────────
        private string _requestId = "";
        private string _passengerName = "";
        private string? _passengerAvatarUrl;
        private double _passengerRating;
        private int _passengerTripCount;

        // ── Détails du trajet ────────────────────────────────
        private string _departure = "";
        private string _destination = "";
        private string _date = "";
        private string _time = "";
        private int _currentPassengers;
        private int _maxPassengers;
        private double _price;

        // ── État de la décision ──────────────────────────────
        private bool _isActionPending;
        private ReservationDecisionState _decisionState = ReservationDecisionState.None;
        private bool _showConfirmDialog;
        private bool _pendingDecisionIsAccept;

        public string RequestId            { get => _requestId;            set => SetField(ref _requestId, value); }
        public string PassengerName        { get => _passengerName;        set => SetField(ref _passengerName, value); }
        public string? PassengerAvatarUrl  { get => _passengerAvatarUrl;   set => SetField(ref _passengerAvatarUrl, value); }
        public double PassengerRating      { get => _passengerRating;      set => SetField(ref _passengerRating, value); }
        public int    PassengerTripCount   { get => _passengerTripCount;   set => SetField(ref _passengerTripCount, value); }

        public string Departure        { get => _departure;        set => SetField(ref _departure, value); }
        public string Destination      { get => _destination;      set => SetField(ref _destination, value); }
        public string Date             { get => _date;             set => SetField(ref _date, value); }
        public string Time             { get => _time;             set => SetField(ref _time, value); }
        public int    CurrentPassengers { get => _currentPassengers; set => SetField(ref _currentPassengers, value); }
        public int    MaxPassengers    { get => _maxPassengers;    set => SetField(ref _maxPassengers, value); }
        public double Price            { get => _price;            set => SetField(ref _price, value); }

        public bool IsActionPending     { get => _isActionPending;    set => SetField(ref _isActionPending, value); }
        public ReservationDecisionState DecisionState { get => _decisionState; set { SetField(ref _decisionState, value); OnPropertyChanged(nameof(ShowButtons)); OnPropertyChanged(nameof(ShowResult)); OnPropertyChanged(nameof(ResultMessage)); OnPropertyChanged(nameof(ResultColorHex)); } }
        public bool ShowConfirmDialog   { get => _showConfirmDialog;  set => SetField(ref _showConfirmDialog, value); }
        public bool PendingDecisionIsAccept { get => _pendingDecisionIsAccept; set => SetField(ref _pendingDecisionIsAccept, value); }

        // Dérivées
        public string  PassengerTripsLabel => $"{PassengerTripCount} trajet{(PassengerTripCount > 1 ? "s" : "")} effectué{(PassengerTripCount > 1 ? "s" : "")}";
        public string  SeatsLabel          => $"{CurrentPassengers}/{MaxPassengers}";
        public string  PriceLabel          => $"{Price:F2} CAD";
        public bool    ShowButtons         => DecisionState == ReservationDecisionState.None;
        public bool    ShowResult          => DecisionState != ReservationDecisionState.None;
        public string  ResultMessage       => DecisionState switch
        {
            ReservationDecisionState.Accepted => "Demande acceptée ✓",
            ReservationDecisionState.Rejected => "Demande refusée ✓",
            ReservationDecisionState.Error    => "Une erreur est survenue",
            _                                 => "",
        };
        public string ResultColorHex => DecisionState switch
        {
            ReservationDecisionState.Accepted => "#dcfce7",
            ReservationDecisionState.Rejected => "#f3f4f6",
            ReservationDecisionState.Error    => "#fee2e2",
            _                                 => "#f3f4f6",
        };
        public string ResultTextColorHex => DecisionState switch
        {
            ReservationDecisionState.Accepted => "#166534",
            ReservationDecisionState.Rejected => "#374151",
            ReservationDecisionState.Error    => "#991b1b",
            _                                 => "#374151",
        };

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(name);
            return true;
        }
    }
}
