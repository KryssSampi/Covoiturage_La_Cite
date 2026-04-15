// Features/goboard/DisplayControler/GoboardDisplayController.cs

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.goboard.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Features.goboard.Services;

namespace Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayControler
{
    public class GoboardDisplayController : INotifyPropertyChanged
    {
        private readonly IGoboardService _service;

        private GoScoreHeroDisplayModel   _goScoreHero   = default!;
        private GoTaskListDisplayModel    _taskList      = default!;
        private LeaderboardDisplayModel   _leaderboard   = default!;
        private EcoChallengesDisplayModel _ecoChallenges = default!;
        private ScoreHistoryDisplayModel  _scoreHistory  = default!;
        private bool                      _isLoading     = true;

        public GoScoreHeroDisplayModel   GoScoreHero   { get => _goScoreHero;   private set => Set(ref _goScoreHero,   value); }
        public GoTaskListDisplayModel    TaskList      { get => _taskList;      private set => Set(ref _taskList,      value); }
        public LeaderboardDisplayModel   Leaderboard   { get => _leaderboard;   private set => Set(ref _leaderboard,   value); }
        public EcoChallengesDisplayModel EcoChallenges { get => _ecoChallenges; private set => Set(ref _ecoChallenges, value); }
        public ScoreHistoryDisplayModel  ScoreHistory  { get => _scoreHistory;  private set => Set(ref _scoreHistory,  value); }
        public bool                      IsLoading     { get => _isLoading;     private set => Set(ref _isLoading,     value); }

        public ICommand RefreshCommand { get; }

        public GoboardDisplayController(IGoboardService service)
        {
            _service = service;
            RefreshCommand = new Command(async () => await LoadAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            await Task.Delay(80);

            var rawHero       = GoboardFixtures.GoScoreHero();
            var rawTasks      = GoboardFixtures.TaskList();
            var rawLeaderboard = GoboardFixtures.Leaderboard();
            var rawChallenges = GoboardFixtures.EcoChallenges();
            var rawHistory    = GoboardFixtures.ScoreHistory();

            var gaugePercent = _service.ComputeGaugePercent(rawHero.Score, rawHero.MaxScore);
            var levelLabel   = _service.ComputeLevelLabel(rawHero.Score, rawHero.MaxScore);
            var (_, rankLabel) = _service.ComputeRankDisplay(
                rawLeaderboard.Entries.First(e => e.IsMe).Rank);

            GoScoreHero = rawHero with
            {
                GaugePercent = gaugePercent,
                LevelLabel   = levelLabel,
                RankLabel    = rankLabel,
            };

            TaskList = rawTasks with
            {
                PotentialPoints = _service.ComputePotentialPoints(rawTasks.Tasks),
            };
            Leaderboard   = rawLeaderboard;
            EcoChallenges = rawChallenges;
            ScoreHistory  = rawHistory;

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
