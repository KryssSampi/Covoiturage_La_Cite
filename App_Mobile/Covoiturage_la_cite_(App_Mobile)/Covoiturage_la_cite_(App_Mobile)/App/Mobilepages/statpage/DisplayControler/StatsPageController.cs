// ============================================================
//  App/Mobilepages/statpage/DisplayControler/StatsPageController.cs
//  Agrège GoboardDisplayController, StatistiquesDisplayController,
//  FinancesDisplayController en un seul BindingContext pour StatPage.
//
//  Tabs : 0 = GoBoard, 1 = Statistiques, 2 = Finances
//  Le tab Finances n'est affiché que si canBeDriver = true.
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.statistiques.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.statpage.DisplayControler
{
    public class StatsPageController : INotifyPropertyChanged
    {
        public GoboardDisplayController       Goboard  { get; }
        public StatistiquesDisplayController  Stats    { get; }
        public FinancesDisplayController      Finance  { get; }

        /// <summary>true = l'utilisateur peut être conducteur → onglet Finances visible.</summary>
        public bool CanBeDriver { get; }

        private int _selectedTab = 0;
        public int SelectedTab
        {
            get => _selectedTab;
            private set
            {
                if (Set(ref _selectedTab, value))
                {
                    OnPropertyChanged(nameof(IsGoBoardVisible));
                    OnPropertyChanged(nameof(IsStatsVisible));
                    OnPropertyChanged(nameof(IsFinanceVisible));
                }
            }
        }

        public bool IsGoBoardVisible => SelectedTab == 0;
        public bool IsStatsVisible   => SelectedTab == 1;
        public bool IsFinanceVisible => SelectedTab == 2;

        private bool _isLoading = true;
        public bool IsLoading { get => _isLoading; private set => Set(ref _isLoading, value); }

        public ICommand SelectTabCommand { get; }
        public ICommand RefreshCommand   { get; }

        public StatsPageController(
            GoboardDisplayController      goboard,
            StatistiquesDisplayController stats,
            FinancesDisplayController     finance,
            bool                          canBeDriver = false)
        {
            Goboard     = goboard;
            Stats       = stats;
            Finance     = finance;
            CanBeDriver = canBeDriver;

            SelectTabCommand = new Command<string>(tab =>
            {
                if (int.TryParse(tab, out var i))
                    SelectedTab = i;
            });

            RefreshCommand = new Command(async () => await LoadAllAsync());
        }

        public async Task LoadAllAsync()
        {
            IsLoading = true;
            var tasks = new List<Task> { Goboard.LoadAsync(), Stats.LoadAsync() };
            if (CanBeDriver) tasks.Add(Finance.LoadAsync());
            await Task.WhenAll(tasks);
            IsLoading = false;
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? n = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));
        private bool Set<T>(ref T f, T v, [CallerMemberName] string? n = null)
        {
            if (EqualityComparer<T>.Default.Equals(f, v)) return false;
            f = v; OnPropertyChanged(n); return true;
        }
    }
}
