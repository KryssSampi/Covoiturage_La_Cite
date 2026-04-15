
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.homepage.view
{
    public partial class HomePage : ContentView
    {
        private readonly HomePageDisplayController _controller;
        private const double SearchBarLiftHeight = 100;
        private const uint SearchBarLiftDurationMs = 160;
        private double _baseScrollHeight = -1;
        private Thickness _baseScrollMargin;
        private bool _isLifted;
        private bool _isAnimating;

        public HomePage(HomePageDisplayController controller)
        {
            InitializeComponent();
            _controller = controller;
            BindingContext = controller;
            _baseScrollMargin = MainScrollView.Margin;
            MainScrollView.SizeChanged += OnMainScrollSizeChanged;
        }

        private void OnMainScrollSizeChanged(object? sender, EventArgs e)
        {
            if (_baseScrollHeight < 0 && MainScrollView.Height > 0)
                _baseScrollHeight = MainScrollView.Height;
        }

        private void OnMainScrollViewScrolled(object? sender, ScrolledEventArgs e)
        {
            if (SearchBarView is null) return;
            bool shouldLift = e.ScrollY > 0;
            if (shouldLift == _isLifted || _isAnimating) return;
            _isLifted = shouldLift;
            _ = AnimateSearchBarShiftAsync(shouldLift);
        }

        private async Task AnimateSearchBarShiftAsync(bool lift)
        {
            _isAnimating = true;

            double fromY = SearchBarView.TranslationY;
            double toY = lift ? -SearchBarLiftHeight : 0;
            double fromHeight = _baseScrollHeight > 0 ? MainScrollView.HeightRequest : -1;
            double toHeight = _baseScrollHeight > 0
                ? (lift ? _baseScrollHeight + SearchBarLiftHeight : _baseScrollHeight)
                : -1;
            Thickness fromMargin = MainScrollView.Margin;
            Thickness toMargin = lift
                ? new Thickness(_baseScrollMargin.Left, _baseScrollMargin.Top - SearchBarLiftHeight,
                                _baseScrollMargin.Right, _baseScrollMargin.Bottom)
                : _baseScrollMargin;

            var easing = Easing.CubicOut;

            var animation = new Animation(v =>
            {
                SearchBarView.TranslationY = fromY + (toY - fromY) * v;
                if (fromHeight > 0 && toHeight > 0)
                    MainScrollView.HeightRequest = fromHeight + (toHeight - fromHeight) * v;
                MainScrollView.Margin = new Thickness(
                    fromMargin.Left + (toMargin.Left - fromMargin.Left) * v,
                    fromMargin.Top + (toMargin.Top - fromMargin.Top) * v,
                    fromMargin.Right + (toMargin.Right - fromMargin.Right) * v,
                    fromMargin.Bottom + (toMargin.Bottom - fromMargin.Bottom) * v
                );
            }, 0, 1, easing);

            var tcs = new TaskCompletionSource();
            animation.Commit(this, "SearchBarLift", 16, SearchBarLiftDurationMs, easing, (v, c) => tcs.SetResult());
            await tcs.Task;

            _isAnimating = false;
        }

        protected override async void OnParentSet()
        {
            base.OnParentSet();
            if (Parent is not null)
                await _controller.InitializeAsync();
        }
    }
}
