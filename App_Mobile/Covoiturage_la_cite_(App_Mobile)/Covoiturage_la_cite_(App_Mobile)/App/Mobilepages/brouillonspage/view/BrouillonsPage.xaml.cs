// ============================================================
//  App/Mobilepages/brouillonspage/view/BrouillonsPage.xaml.cs
//  Tap → CreateTripPage pré-remplie avec les données du brouillon.
// ============================================================

using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.brouillonspage.view
{
    public partial class BrouillonsPage : ContentPage
    {
        private readonly UserViewModel _userViewModel;
        private BrouillonsListDisplayController? _listController;
        private string _driverId = string.Empty;
        private bool _isLoaded;

        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        public BrouillonsPage(UserViewModel userViewModel)
        {
            InitializeComponent();
            BindingContext = this;
            _userViewModel = userViewModel;
        }

        // ─────────────────────────────────────────────────────────────
        //  Chargement différé — libère le UI thread au démarrage
        // ─────────────────────────────────────────────────────────────
        protected override void OnAppearing()
        {
            base.OnAppearing();
            if (_isLoaded) return;
            _isLoaded = true;

            _driverId = _userViewModel.FirstName; // TODO: utiliser vrai driverId

            _listController = new BrouillonsListDisplayController();
            _listController.OnCardTap = async card => await NavigateToDraft(card);

            BrouillonsList.SetController(_listController.ListController);
        }

        private void OnBrouillonCardTapped(object sender, TappedEventArgs e)
        {
            if (_listController is null) return;
            if (sender is VisualElement ve && ve.BindingContext is BrouillonCardDisplayModel card)
                _listController.HandleCardTap(card);
        }

        private async void OnNewDraftTapped(object sender, TappedEventArgs e)
        {
            var driverId = Uri.EscapeDataString(_driverId);
            await Shell.Current.GoToAsync($"createtrip?driverId={driverId}");
        }

        private async Task NavigateToDraft(BrouillonCardDisplayModel card)
        {
            // Récupère le FormState du brouillon et passe les champs en query params
            var form = BrouillonsFixtures.FormStateById(card.Id);
            var driverId = Uri.EscapeDataString(_driverId);

            if (form is null)
            {
                await Shell.Current.GoToAsync($"createtrip?driverId={driverId}");
                return;
            }

            var dep  = Uri.EscapeDataString(form.DepartureLocation ?? "");
            var arr  = Uri.EscapeDataString(form.ArrivalLocation ?? "");
            var date = Uri.EscapeDataString(form.DepartureDate ?? "");
            var time = Uri.EscapeDataString(form.DepartureTime ?? "");

            await Shell.Current.GoToAsync(
                $"createtrip?driverId={driverId}&departure={dep}&arrival={arr}&date={date}&time={time}");
        }
    }
}
