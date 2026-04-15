// ============================================================
//  Features/reservationrequest/DisplayControler/
//  ReservationRequestDisplayController.cs
//  Orchestre la vue détail d'une demande de réservation (driver).
//  Expose les commandes Accepter / Refuser injectées par la page.
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayControler
{
    public class ReservationRequestDisplayController : INotifyPropertyChanged
    {
        private ReservationRequestDetailDisplayModel? _detail;

        public ReservationRequestDetailDisplayModel? Detail
        {
            get => _detail;
            private set => SetField(ref _detail, value);
        }

        // Actions injectées par la page (branchées sur l'API)
        public Func<string, Task<bool>>? OnAccept { get; set; }
        public Func<string, Task<bool>>? OnReject { get; set; }

        public ICommand RequestAcceptCommand { get; }
        public ICommand RequestRejectCommand { get; }
        public ICommand ConfirmDecisionCommand { get; }
        public ICommand CancelDecisionCommand { get; }

        public ReservationRequestDisplayController()
        {
            // Ouvre le dialog de confirmation avant d'agir
            RequestAcceptCommand = new Command(() =>
            {
                if (Detail is null) return;
                Detail.PendingDecisionIsAccept = true;
                Detail.ShowConfirmDialog = true;
            }, () => Detail?.ShowButtons == true && !Detail.IsActionPending);

            RequestRejectCommand = new Command(() =>
            {
                if (Detail is null) return;
                Detail.PendingDecisionIsAccept = false;
                Detail.ShowConfirmDialog = true;
            }, () => Detail?.ShowButtons == true && !Detail.IsActionPending);

            ConfirmDecisionCommand = new Command(async () =>
            {
                if (Detail is null) return;
                Detail.ShowConfirmDialog = false;
                Detail.IsActionPending = true;

                bool isAccept = Detail.PendingDecisionIsAccept;
                try
                {
                    bool ok = isAccept
                        ? (OnAccept is not null && await OnAccept(Detail.RequestId))
                        : (OnReject is not null && await OnReject(Detail.RequestId));

                    Detail.DecisionState = ok
                        ? (isAccept ? ReservationDecisionState.Accepted : ReservationDecisionState.Rejected)
                        : ReservationDecisionState.Error;
                }
                catch
                {
                    Detail.DecisionState = ReservationDecisionState.Error;
                }
                finally
                {
                    Detail.IsActionPending = false;
                }
            });

            CancelDecisionCommand = new Command(() =>
            {
                if (Detail is not null)
                    Detail.ShowConfirmDialog = false;
            });
        }

        public void Load(ReservationRequestModel request)
        {
            Detail = ReservationRequestDisplayConverter.ToDetailDisplayModel(request);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
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
