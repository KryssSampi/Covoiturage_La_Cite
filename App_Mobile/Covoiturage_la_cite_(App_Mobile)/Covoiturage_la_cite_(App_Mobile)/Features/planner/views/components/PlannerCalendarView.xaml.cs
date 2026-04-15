// Features/planner/views/components/PlannerCalendarView.xaml.cs
// ════════════════════════════════════════════════════════════════════════
// Code-behind du calendrier.
// Gère :
//   - Swipe gauche → mois suivant
//   - Swipe droite → mois précédent
//   - Animation de transition de la grille
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;


namespace Covoiturage_la_cite__App_Mobile_.Features.planner.views.components;

public partial class PlannerCalendarView : ContentView
{
    private PlannerDisplayController? _ctrl;
    private bool _isAnimating = false;

    public PlannerCalendarView()
    {
        InitializeComponent();

        // ── Swipe gestes ────────────────────────────────────────────
        var swipeLeft = new SwipeGestureRecognizer
        {
            Direction = SwipeDirection.Left,
            Threshold = 40,
        };
        swipeLeft.Swiped += OnSwipeLeft;

        var swipeRight = new SwipeGestureRecognizer
        {
            Direction = SwipeDirection.Right,
            Threshold = 40,
        };
        swipeRight.Swiped += OnSwipeRight;

        CalendarGrid.GestureRecognizers.Add(swipeLeft);
        CalendarGrid.GestureRecognizers.Add(swipeRight);
    }

    // ══════════════════════════════════════════════════════════════════
    // BindingContext
    // ══════════════════════════════════════════════════════════════════

    protected override void OnBindingContextChanged()
    {
        base.OnBindingContextChanged();
        _ctrl = BindingContext as PlannerDisplayController;
    }

    // ══════════════════════════════════════════════════════════════════
    // Swipe
    // ══════════════════════════════════════════════════════════════════

    private async void OnSwipeLeft(object? sender, SwipedEventArgs e)
    {
        if (_isAnimating || _ctrl == null || !_ctrl.CanGoForward) return;
        await AnimateTransitionAsync(toLeft: true,
            () => _ctrl.NextMonthCommand.Execute(null));
    }

    private async void OnSwipeRight(object? sender, SwipedEventArgs e)
    {
        if (_isAnimating || _ctrl == null || !_ctrl.CanGoBack) return;
        await AnimateTransitionAsync(toLeft: false,
            () => _ctrl.PreviousMonthCommand.Execute(null));
    }

    // ══════════════════════════════════════════════════════════════════
    // Animation transition mois
    // ══════════════════════════════════════════════════════════════════

    private async Task AnimateTransitionAsync(bool toLeft, Action changeMonth)
    {
        _isAnimating = true;
        const uint duration = 200;
        double width = CalendarGrid.Width > 0 ? CalendarGrid.Width : 358;

        // Slide out vers la gauche ou droite
        await CalendarGrid.TranslateTo(toLeft ? -width : width, 0, duration, Easing.CubicIn);
        CalendarGrid.Opacity = 0;
        CalendarGrid.TranslationX = 0;

        // Change de mois (rebuild des cellules)
        changeMonth();

        // Slide in depuis le côté opposé
        CalendarGrid.TranslationX = toLeft ? width : -width;
        await Task.WhenAll(
            CalendarGrid.TranslateTo(0, 0, duration, Easing.CubicOut),
            CalendarGrid.FadeTo(1, duration));

        _isAnimating = false;
    }
}

