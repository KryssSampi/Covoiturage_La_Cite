// ============================================================
//  App/Mobilepages/createtrippage/DisplayModels/
//  CreateTripPageDisplayModel.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.createtrip.DisplayModels;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.DisplayModels
{
    public class CreateTripPageDisplayModel : INotifyPropertyChanged
    {
        private bool _isLoading = true;
        private string _pageTitle = "Créer un trajet";
        private string _driverFirstName = "Conducteur";

        // Sections de la feature (alimentées par le controller)
        public BasicInfoSectionDisplayModel BasicInfo { get; set; } = new();
        public VehicleSectionDisplayModel Vehicle { get; set; } = new();
        public PricingSectionDisplayModel Pricing { get; set; } = new();
        public TripToastDisplayModel Toast { get; set; } = new();

        public bool IsLoading { get => _isLoading; set => SetField(ref _isLoading, value); }
        public string PageTitle { get => _pageTitle; set => SetField(ref _pageTitle, value); }
        public string DriverFirstName
        {
            get => _driverFirstName;
            set
            {
                if (SetField(ref _driverFirstName, value))
                {
                    OnPropertyChanged(nameof(WelcomeLabel));
                }
            }
        }

        public string WelcomeLabel => $"Créer votre trajet, Captain {DriverFirstName}";

        // Commandes (déléguées depuis le feature controller)
        public ICommand? IncrementPriceCommand { get; set; }
        public ICommand? DecrementPriceCommand { get; set; }
        public ICommand? IncrementSeatsCommand { get; set; }
        public ICommand? DecrementSeatsCommand { get; set; }
        public ICommand? SetTripTypeUniqueCommand { get; set; }
        public ICommand? SetTripTypeRecurrentCommand { get; set; }
        public ICommand? SetPaymentCashCommand { get; set; }
        public ICommand? SetPaymentInteracCommand { get; set; }
        public ICommand? PublishCommand { get; set; }
        public ICommand? SaveDraftCommand { get; set; }
        public ICommand? DismissToastCommand { get; set; }
        public ICommand? DismissIndispoCommand { get; set; }
        public ICommand? ConfirmDespiteIndispoCommand { get; set; }

        private bool _showIndispoWarning;
        private bool _isSubmitting;
        public bool ShowIndispoWarning { get => _showIndispoWarning; set => SetField(ref _showIndispoWarning, value); }
        public bool IsSubmitting { get => _isSubmitting; set => SetField(ref _isSubmitting, value); }

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
