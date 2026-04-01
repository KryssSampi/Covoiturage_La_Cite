// ============================================================
//  Features/createtrip/DisplayControler/CreateTripDisplayController.cs
//  Orchestre l'état du formulaire de création de trajet.
//  Miroir de useCreateTrip (web).
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.createtrip.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.createtrip.DisplayControler
{
    public class CreateTripDisplayController : INotifyPropertyChanged
    {
        // ── Sections ─────────────────────────────────────────
        private BasicInfoSectionDisplayModel  _basicInfo  = new();
        private VehicleSectionDisplayModel    _vehicle    = new();
        private PricingSectionDisplayModel    _pricing    = new();
        private TripToastDisplayModel         _toast      = new();
        private bool _isSubmitting;
        private bool _showIndispoWarning;

        public BasicInfoSectionDisplayModel  BasicInfo  { get => _basicInfo;  private set => SetField(ref _basicInfo, value); }
        public VehicleSectionDisplayModel    Vehicle    { get => _vehicle;    private set => SetField(ref _vehicle, value); }
        public PricingSectionDisplayModel    Pricing    { get => _pricing;    private set => SetField(ref _pricing, value); }
        public TripToastDisplayModel         Toast      { get => _toast;      private set => SetField(ref _toast, value); }
        public bool IsSubmitting             { get => _isSubmitting;      set => SetField(ref _isSubmitting, value); }
        public bool ShowIndispoWarning       { get => _showIndispoWarning; set => SetField(ref _showIndispoWarning, value); }

        // Actions injectées par la page
        public Func<CreateTripFormState, Task<(bool ok, string? tripId, string? message)>>? OnPublish { get; set; }
        public Func<CreateTripFormState, Task<(bool ok, string? message)>>? OnSaveDraft { get; set; }

        // ── Commandes ─────────────────────────────────────────
        public ICommand IncrementPriceCommand     { get; }
        public ICommand DecrementPriceCommand     { get; }
        public ICommand IncrementSeatsCommand     { get; }
        public ICommand DecrementSeatsCommand     { get; }
        public ICommand SetTripTypeUniqueCommand  { get; }
        public ICommand SetTripTypeRecurrentCommand { get; }
        public ICommand SetPaymentCashCommand     { get; }
        public ICommand SetPaymentInteracCommand  { get; }
        public ICommand PublishCommand            { get; }
        public ICommand SaveDraftCommand          { get; }
        public ICommand DismissToastCommand       { get; }
        public ICommand DismissIndispoCommand     { get; }
        public ICommand ConfirmDespiteIndispoCommand { get; }

        public CreateTripDisplayController()
        {
            IncrementPriceCommand = new Command(() =>
            {
                Pricing.PricePerPassenger = Math.Round(Pricing.PricePerPassenger + 0.50, 2);
            });

            DecrementPriceCommand = new Command(() =>
            {
                if (Pricing.PricePerPassenger > 1.0)
                    Pricing.PricePerPassenger = Math.Round(Pricing.PricePerPassenger - 0.50, 2);
            });

            IncrementSeatsCommand = new Command(() =>
            {
                if (Vehicle.AvailableSeats < Vehicle.MaxSeatsAllowed)
                    Vehicle.AvailableSeats++;
            });

            DecrementSeatsCommand = new Command(() =>
            {
                if (Vehicle.AvailableSeats > 1)
                    Vehicle.AvailableSeats--;
            });

            SetTripTypeUniqueCommand    = new Command(() => BasicInfo.IsUnique = true);
            SetTripTypeRecurrentCommand = new Command(() => BasicInfo.IsUnique = false);
            SetPaymentCashCommand       = new Command(() => Pricing.IsCash = true);
            SetPaymentInteracCommand    = new Command(() => Pricing.IsCash = false);

            DismissToastCommand = new Command(() => Toast.IsOpen = false);
            DismissIndispoCommand = new Command(() => ShowIndispoWarning = false);

            ConfirmDespiteIndispoCommand = new Command(async () =>
            {
                ShowIndispoWarning = false;
                await PublishAsync(ignoreIndispo: true);
            });

            PublishCommand = new Command(async () =>
            {
                if (IsSubmitting) return;
                if (!Validate()) return;
                // TODO : vérifier indisponibilité via API avant de publier
                await PublishAsync();
            });

            SaveDraftCommand = new Command(async () =>
            {
                if (IsSubmitting) return;
                IsSubmitting = true;
                var state = BuildFormState();
                try
                {
                    var result = OnSaveDraft is not null
                        ? await OnSaveDraft(state)
                        : (ok: false, message: "Service non disponible");

                    Toast.IsSuccess = result.ok;
                    Toast.Title   = result.ok ? "Brouillon enregistré" : "Erreur";
                    Toast.Message = result.message ?? (result.ok ? "Votre trajet a été sauvegardé." : "Impossible de sauvegarder.");
                    Toast.OkLabel = "Fermer";
                    Toast.IsOpen  = true;
                }
                finally { IsSubmitting = false; }
            });
        }

        // ── Initialisation depuis la page ────────────────────
        public void Initialize(
            IReadOnlyList<VehicleModel> vehicles,
            CreateTripFormState? prefill = null)
        {
            Vehicle.Vehicles = vehicles.Select(v =>
                new VehiclePickerItem(v.Id, v.Label, v.MaxPassengers, v.Color)).ToList();

            if (prefill is not null)
            {
                BasicInfo.DepartureLocation = prefill.DepartureLocation;
                BasicInfo.ArrivalLocation   = prefill.ArrivalLocation;
                BasicInfo.DepartureDate     = prefill.DepartureDate;
                BasicInfo.DepartureTime     = prefill.DepartureTime;
            }
        }

        // ── Validation ───────────────────────────────────────
        private bool Validate()
        {
            bool ok = true;

            BasicInfo.ErrorDeparture = string.IsNullOrWhiteSpace(BasicInfo.DepartureLocation)
                ? "Lieu de départ requis" : null;
            BasicInfo.ErrorArrival   = string.IsNullOrWhiteSpace(BasicInfo.ArrivalLocation)
                ? "Lieu d'arrivée requis" : null;
            BasicInfo.ErrorDate = string.IsNullOrWhiteSpace(BasicInfo.DepartureDate)
                ? "Date requise" : null;
            BasicInfo.ErrorTime = string.IsNullOrWhiteSpace(BasicInfo.DepartureTime)
                ? "Heure requise" : null;
            Vehicle.ErrorVehicle = Vehicle.SelectedVehicle is null
                ? "Sélectionnez un véhicule" : null;

            if (BasicInfo.HasErrorDeparture || BasicInfo.HasErrorArrival ||
                BasicInfo.HasErrorDate || BasicInfo.HasErrorTime ||
                Vehicle.HasErrorVehicle)
                ok = false;

            return ok;
        }

        // ── Publication ──────────────────────────────────────
        private async Task PublishAsync(bool ignoreIndispo = false)
        {
            IsSubmitting = true;
            var state = BuildFormState();
            try
            {
                var result = OnPublish is not null
                    ? await OnPublish(state)
                    : (ok: false, tripId: (string?)null, message: "Service non disponible");

                Toast.IsSuccess = result.ok;
                Toast.Title   = result.ok ? "Trajet publié !" : "Erreur de publication";
                Toast.Message = result.message ?? (result.ok ? "Votre trajet est maintenant visible." : "Impossible de publier le trajet.");
                Toast.OkLabel = result.ok ? "Voir le planificateur" : "Fermer";
                Toast.IsOpen  = true;
            }
            finally { IsSubmitting = false; }
        }

        // ── Assemblage du FormState ──────────────────────────
        private CreateTripFormState BuildFormState() => new()
        {
            DepartureLocation      = BasicInfo.DepartureLocation,
            ArrivalLocation        = BasicInfo.ArrivalLocation,
            DepartureInstructions  = BasicInfo.DepartureInstructions,
            ArrivalInstructions    = BasicInfo.ArrivalInstructions,
            DepartureDate          = BasicInfo.DepartureDate,
            DepartureTime          = BasicInfo.DepartureTime,
            VehicleId              = Vehicle.SelectedVehicle?.Id ?? "",
            TripType               = BasicInfo.IsUnique ? TripType.Unique : TripType.Recurrent,
            AvailableSeats         = Vehicle.AvailableSeats,
            PricePerPassenger      = Pricing.PricePerPassenger,
            PaymentMethod          = Pricing.IsCash ? PaymentMethod.Cash : PaymentMethod.Interac,
            Preferences            = new TripFormPreferences
            {
                BaggageAllowed    = Pricing.BaggageAllowed,
                PetsAllowed       = Pricing.PetsAllowed,
                SmokingAllowed    = Pricing.SmokingAllowed,
                MusicAllowed      = Pricing.MusicAllowed,
                FlexibleItinerary = Pricing.FlexibleItinerary,
                DriverNote        = Pricing.DriverNote,
            },
        };

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
