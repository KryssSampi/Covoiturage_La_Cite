// Features/finances/Views/Components/BalanceHeroView.xaml.cs

using Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.finances.Views.Components
{
    public partial class BalanceHeroView : ContentView
    {
        // Appelée depuis StatsPage via le controller agrégat
        public Action? OnWithdraw { get; set; }

        public BalanceHeroView() => InitializeComponent();

        private async void OnWithdrawClicked(object sender, EventArgs e)
        {
            if (OnWithdraw is not null)
            {
                OnWithdraw();
                return;
            }
            // Fallback si pas de handler
            if (BindingContext is BalanceHeroDisplayModel m && m.CanWithdraw)
                await Shell.Current.DisplayAlert("Retrait",
                    "Simulation : retrait en cours vers " + m.IbanMasked, "OK");
        }
    }
}
