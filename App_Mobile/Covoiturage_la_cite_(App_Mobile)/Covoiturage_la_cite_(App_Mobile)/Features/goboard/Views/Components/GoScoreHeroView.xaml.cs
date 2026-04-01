// Features/goboard/Views/Components/GoScoreHeroView.xaml.cs

using Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.goboard.Views.Components
{
    public partial class GoScoreHeroView : ContentView
    {
        public GoScoreHeroView()
        {
            InitializeComponent();
            SizeChanged += OnSizeChanged;
            BindingContextChanged += OnModelChanged;
        }

        private void OnModelChanged(object? sender, EventArgs e) => UpdateGauge();
        private void OnSizeChanged(object? sender, EventArgs e)  => UpdateGauge();

        private void UpdateGauge()
        {
            if (BindingContext is GoScoreHeroDisplayModel m && GaugeGrid.Width > 0)
                GaugeFill.WidthRequest = Math.Max(0, m.GaugePercent * (GaugeGrid.Width - 32));
        }
    }
}
