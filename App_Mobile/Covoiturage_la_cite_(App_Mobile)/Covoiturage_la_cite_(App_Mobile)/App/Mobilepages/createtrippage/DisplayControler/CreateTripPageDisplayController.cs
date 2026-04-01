// ============================================================
//  App/Mobilepages/createtrippage/DisplayControler/
//  CreateTripPageDisplayController.cs
//
//  Orchestre CreateTripPage :
//   - Reçoit driverId + prefill via QueryProperty
//   - Charge les véhicules du conducteur (fixtures → TODO API)
//   - Nourrit CreateTripDisplayController (feature)
//   - Injecte les handlers publish/saveDraft (→ TODO API)
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.createtrip.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.DisplayControler
{
    [QueryProperty(nameof(DriverId),         "driverId")]
    [QueryProperty(nameof(PrefillDeparture), "departure")]
    [QueryProperty(nameof(PrefillArrival),   "arrival")]
    [QueryProperty(nameof(PrefillDate),      "date")]
    [QueryProperty(nameof(PrefillTime),      "time")]
    public class CreateTripPageDisplayController : INotifyPropertyChanged
    {
        private readonly CreateTripDisplayController _featureController;
        private readonly UserViewModel               _userViewModel;
        private readonly CreateTripPageDisplayModel  _pageModel;

        private string? _driverId;
        private string? _prefillDeparture;
        private string? _prefillArrival;
        private string? _prefillDate;
        private string? _prefillTime;
        private bool    _loadScheduled;

        public CreateTripPageDisplayModel PageModel => _pageModel;

        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        public CreateTripPageDisplayController(
            CreateTripDisplayController featureController,
            UserViewModel userViewModel)
        {
            _featureController = featureController;
            _userViewModel     = userViewModel;

            _pageModel = new CreateTripPageDisplayModel
            {
                BasicInfo  = featureController.BasicInfo,
                Vehicle    = featureController.Vehicle,
                Pricing    = featureController.Pricing,
                Toast      = featureController.Toast,

                IncrementPriceCommand        = featureController.IncrementPriceCommand,
                DecrementPriceCommand        = featureController.DecrementPriceCommand,
                IncrementSeatsCommand        = featureController.IncrementSeatsCommand,
                DecrementSeatsCommand        = featureController.DecrementSeatsCommand,
                SetTripTypeUniqueCommand     = featureController.SetTripTypeUniqueCommand,
                SetTripTypeRecurrentCommand  = featureController.SetTripTypeRecurrentCommand,
                SetPaymentCashCommand        = featureController.SetPaymentCashCommand,
                SetPaymentInteracCommand     = featureController.SetPaymentInteracCommand,
                PublishCommand               = featureController.PublishCommand,
                SaveDraftCommand             = featureController.SaveDraftCommand,
                DismissToastCommand          = featureController.DismissToastCommand,
                DismissIndispoCommand        = featureController.DismissIndispoCommand,
                ConfirmDespiteIndispoCommand = featureController.ConfirmDespiteIndispoCommand,
            };

            _featureController.PropertyChanged += (_, e) =>
            {
                if (e.PropertyName == nameof(CreateTripDisplayController.IsSubmitting))
                    _pageModel.IsSubmitting = _featureController.IsSubmitting;
                if (e.PropertyName == nameof(CreateTripDisplayController.ShowIndispoWarning))
                    _pageModel.ShowIndispoWarning = _featureController.ShowIndispoWarning;
            };
        }

        public string? DriverId { get => _driverId; set { _driverId = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? PrefillDeparture { get => _prefillDeparture; set { _prefillDeparture = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? PrefillArrival   { get => _prefillArrival;   set { _prefillArrival   = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? PrefillDate      { get => _prefillDate;      set { _prefillDate      = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }
        public string? PrefillTime      { get => _prefillTime;      set { _prefillTime      = Uri.UnescapeDataString(value ?? ""); TryLoad(); } }

        private void TryLoad()
        {
            if (string.IsNullOrWhiteSpace(_driverId) || _loadScheduled) return;
            _loadScheduled = true;
            _ = Task.Run(async () => { await Task.Delay(50); await LoadAsync(); });
        }

        private async Task LoadAsync()
        {
            _pageModel.IsLoading = true;
            try
            {
                // Prénom du conducteur (depuis UserViewModel si disponible)
                var firstName = _userViewModel.User?.FirstName
                    ?? _driverId?.Split('-').FirstOrDefault()
                    ?? "Conducteur";
                _pageModel.DriverFirstName = firstName;
                _pageModel.PageTitle = $"Créer — Captain {firstName}";

                // ── TODO : GET /api/vehicles?driverId={_driverId} ──
                var vehicles = await Task.Run(() =>
                    VehicleFixtures.ForDriver(_driverId ?? ""));

                var prefill = new CreateTripFormState();
                if (!string.IsNullOrWhiteSpace(_prefillDeparture)) prefill.DepartureLocation = _prefillDeparture;
                if (!string.IsNullOrWhiteSpace(_prefillArrival))   prefill.ArrivalLocation   = _prefillArrival;
                if (!string.IsNullOrWhiteSpace(_prefillDate))      prefill.DepartureDate      = _prefillDate;
                if (!string.IsNullOrWhiteSpace(_prefillTime))      prefill.DepartureTime      = _prefillTime;

                _featureController.Initialize(vehicles, prefill);

                // Injection handlers API
                _featureController.OnPublish = async state =>
                {
                    // TODO : POST /api/trips body=state
                    await Task.Delay(500);
                    return (ok: true, tripId: "new-trip-id", message: "Votre trajet est maintenant visible.");
                };
                _featureController.OnSaveDraft = async state =>
                {
                    // TODO : POST /api/trips/drafts body=state
                    await Task.Delay(300);
                    return (ok: true, message: "Brouillon enregistré.");
                };
            }
            finally
            {
                _pageModel.IsLoading = false;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
