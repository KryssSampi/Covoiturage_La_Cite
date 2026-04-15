// ============================================================
//  App/Mobilepages/historiquepage/view/HistoriquePage.xaml.cs
// ============================================================

using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.historiquepage.view
{
    public partial class HistoriquePage : ContentPage
    {
        private readonly UserViewModel _userViewModel;
        private bool _isLoaded;

        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        public HistoriquePage(UserViewModel userViewModel)
        {
            InitializeComponent();
            BindingContext = this;
            _userViewModel = userViewModel;
        }

        // ?????????????????????????????????????????????????????????????
        //  Chargement différé — libère le UI thread au démarrage
        // ?????????????????????????????????????????????????????????????
        protected override void OnAppearing()
        {
            base.OnAppearing();
            if (_isLoaded) return;
            _isLoaded = true;

            var canBeDriver = _userViewModel.Role == UserRole.Driver;
            var ctrl = new HistoriqueListDisplayController(canBeDriver);
            HistList.SetController(ctrl.ListController);
        }
    }
}
