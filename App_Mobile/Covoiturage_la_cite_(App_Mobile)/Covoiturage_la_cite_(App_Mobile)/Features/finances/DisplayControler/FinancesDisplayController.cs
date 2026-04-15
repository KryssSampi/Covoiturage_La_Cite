// Features/finances/DisplayControler/FinancesDisplayController.cs

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.finances.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Features.finances.Services;

namespace Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayControler
{
    public class FinancesDisplayController : INotifyPropertyChanged
    {
        private readonly IFinancesService _service;

        private BalanceHeroDisplayModel    _balance      = default!;
        private FinanceResumeDisplayModel  _resume       = default!;
        private RevenueChartDisplayModel   _chart        = default!;
        private TransactionListDisplayModel _transactions = default!;
        private FinancePeriod              _period       = FinancePeriod.CurrentMonth;
        private bool                       _isLoading    = true;

        public BalanceHeroDisplayModel    Balance      { get => _balance;       private set => Set(ref _balance,       value); }
        public FinanceResumeDisplayModel  Resume       { get => _resume;        private set => Set(ref _resume,        value); }
        public RevenueChartDisplayModel   Chart        { get => _chart;         private set => Set(ref _chart,         value); }
        public TransactionListDisplayModel Transactions { get => _transactions; private set => Set(ref _transactions,  value); }
        public FinancePeriod              Period       { get => _period;        private set => Set(ref _period,        value); }
        public bool                       IsLoading    { get => _isLoading;     private set => Set(ref _isLoading,     value); }

        public ICommand WithdrawCommand     { get; }
        public ICommand SelectPeriodCommand { get; }
        public ICommand RefreshCommand      { get; }

        public FinancesDisplayController(IFinancesService service)
        {
            _service = service;

            WithdrawCommand = new Command(async () =>
            {
                if (Balance?.CanWithdraw == true)
                    await Shell.Current.DisplayAlert("Retrait",
                        "Simulation : retrait en cours vers " + Balance.IbanMasked, "OK");
            });

            SelectPeriodCommand = new Command<string>(p =>
            {
                if (Enum.TryParse<FinancePeriod>(p, out var period))
                    Period = period;
            });

            RefreshCommand = new Command(async () => await LoadAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            await Task.Delay(80);

            Balance = FinancesFixtures.BalanceHero();
            Resume  = FinancesFixtures.Resume();

            var rawChart = FinancesFixtures.RevenueChart();
            Chart = rawChart with
            {
                Bars = _service.NormalizeBars(rawChart.Bars),
            };
            Transactions = FinancesFixtures.Transactions();

            IsLoading = false;
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? n = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));
        private bool Set<T>(ref T f, T v, [CallerMemberName] string? n = null)
        {
            if (EqualityComparer<T>.Default.Equals(f, v)) return false;
            f = v; OnPropertyChanged(n); return true;
        }
    }
}
