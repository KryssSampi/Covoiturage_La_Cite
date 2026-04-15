// ============================================================
//  App/Mobilepages/reservationrequestdetailpage/DisplayModels/
//  ReservationRequestDetailPageDisplayModel.cs
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.reservationrequestdetailpage.DisplayModels
{
    public class ReservationRequestDetailPageDisplayModel : INotifyPropertyChanged
    {
        private bool _isLoading = true;
        private string _pageTitle = "Demande de réservation";
        private ReservationRequestDetailDisplayModel? _requestDetail;

        public bool IsLoading       { get => _isLoading;  set => SetField(ref _isLoading, value); }
        public string PageTitle     { get => _pageTitle;  set => SetField(ref _pageTitle, value); }

        /// <summary>DisplayModel de la feature — nourri par ReservationRequestDetailPageDisplayController.</summary>
        public ReservationRequestDetailDisplayModel? RequestDetail
        {
            get => _requestDetail;
            set => SetField(ref _requestDetail, value);
        }

        // Commandes exposées vers le XAML de la page (délèguent au feature controller)
        public ICommand? RequestAcceptCommand { get; set; }
        public ICommand? RequestRejectCommand { get; set; }
        public ICommand? ConfirmDecisionCommand { get; set; }
        public ICommand? CancelDecisionCommand { get; set; }

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
