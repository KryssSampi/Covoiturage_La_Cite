using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.Services;

namespace Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayControler
{
    public class StatistiquesDisplayController : INotifyPropertyChanged
    {
        private readonly IStatistiquesService _service;

        private KpiGridDisplayModel _kpiGrid = default!;
        private EvaluationSectionDisplayModel _evaluations = default!;
        private RecentTripsDisplayModel _recentTrips = default!;
        private BadgeGridDisplayModel _badges = default!;
        private StatPeriod _selectedPeriod = StatPeriod.CurrentMonth;
        private bool _isLoading = true;

        public KpiGridDisplayModel KpiGrid { get => _kpiGrid; private set => Set(ref _kpiGrid, value); }
        public EvaluationSectionDisplayModel Evaluations { get => _evaluations; private set => Set(ref _evaluations, value); }
        public RecentTripsDisplayModel RecentTrips { get => _recentTrips; private set => Set(ref _recentTrips, value); }
        public BadgeGridDisplayModel Badges { get => _badges; private set => Set(ref _badges, value); }
        public StatPeriod SelectedPeriod { get => _selectedPeriod; private set => Set(ref _selectedPeriod, value); }
        public bool IsLoading { get => _isLoading; private set => Set(ref _isLoading, value); }

        public ICommand SelectPeriodCommand { get; }
        public ICommand RefreshCommand { get; }

        public StatistiquesDisplayController(IStatistiquesService service)
        {
            _service = service;
            SelectPeriodCommand = new Command<string>(p =>
            {
                if (Enum.TryParse<StatPeriod>(p, out var period))
                {
                    SelectedPeriod = period;
                    RecentTrips = _service.FilterTripsByPeriod(
                        StatistiquesFixtures.RecentTrips(), period);
                }
            });
            RefreshCommand = new Command(async () => await LoadAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            await Task.Delay(50);

            var rawEvals = StatistiquesFixtures.Evaluations();
            KpiGrid = StatistiquesFixtures.KpiGrid();
            Evaluations = rawEvals with
            {
                WeeklyBars = _service.NormalizeWeeklyBars(rawEvals.WeeklyBars),
            };
            RecentTrips = StatistiquesFixtures.RecentTrips();
            Badges = StatistiquesFixtures.Badges();

            IsLoading = false;
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? n = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));

        private bool Set<T>(ref T f, T v, [CallerMemberName] string? n = null)
        {
            if (EqualityComparer<T>.Default.Equals(f, v)) return false;
            f = v;
            OnPropertyChanged(n);
            return true;
        }
    }
}
