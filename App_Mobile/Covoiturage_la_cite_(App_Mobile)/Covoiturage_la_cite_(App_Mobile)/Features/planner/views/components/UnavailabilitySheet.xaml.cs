// Features/planner/views/components/UnavailabilitySheet.xaml.cs
// ════════════════════════════════════════════════════════════════════════
// Code-behind de UnavailabilitySheet.
// Responsabilités :
//   - Construire les 7 boutons jours dynamiquement (DayOfWeek)
//   - Brancher DatePicker / TimePicker → commandes du controller
//   - Animer l'apparition / disparition (slide up)
//   - Observer SheetForm.SelectedDays pour mettre à jour l'UI des jours
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.views.components;

public partial class UnavailabilitySheet : ContentView
{
    // Ordre L–D conforme au calendrier (Lundi en premier)
    private static readonly (DayOfWeek Day, string Short, string Long)[] WeekDays =
    [
        (DayOfWeek.Monday,    "L", "Lun"),
        (DayOfWeek.Tuesday,   "M", "Mar"),
        (DayOfWeek.Wednesday, "M", "Mer"),
        (DayOfWeek.Thursday,  "J", "Jeu"),
        (DayOfWeek.Friday,    "V", "Ven"),
        (DayOfWeek.Saturday,  "S", "Sam"),
        (DayOfWeek.Sunday,    "D", "Dim"),
    ];

    // Références aux frames jour (pour mise à jour visuelle rapide)
    private readonly Dictionary<DayOfWeek, Frame> _dayFrames = new();
    private PlannerDisplayController? _ctrl;

    public UnavailabilitySheet()
    {
        InitializeComponent();
        BuildWeekdayPicker();

        // ── DatePicker ──────────────────────────────────────────────
        DatePickerField.DateSelected += (s, e) =>
        {
            _ctrl?.SetSheetDateCommand.Execute((DateTime?)e.NewDate);
            RefreshDayButtons();
        };

        // ── TimePicker ──────────────────────────────────────────────
        StartTimePicker.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName != nameof(TimePicker.Time)) return;
            _ctrl?.SetSheetStartTimeCommand.Execute(StartTimePicker.Time);
        };
        EndTimePicker.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName != nameof(TimePicker.Time)) return;
            _ctrl?.SetSheetEndTimeCommand.Execute(EndTimePicker.Time);
        };

        // ── Switch récurrent ────────────────────────────────────────
        RecurrentSwitch.Toggled += (s, e) =>
            _ctrl?.ToggleRecurrentCommand.Execute(null);
    }

    // ══════════════════════════════════════════════════════════════════
    // BindingContext : on récupère le controller
    // ══════════════════════════════════════════════════════════════════

    protected override void OnBindingContextChanged()
    {
        base.OnBindingContextChanged();
        _ctrl = BindingContext as PlannerDisplayController;

        if (_ctrl != null)
        {
            _ctrl.PropertyChanged += (s, e) =>
            {
                if (e.PropertyName == nameof(PlannerDisplayController.SheetForm))
                    MainThread.BeginInvokeOnMainThread(SyncFormToUI);
            };
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Construction des boutons jours de la semaine
    // ══════════════════════════════════════════════════════════════════

    private void BuildWeekdayPicker()
    {
        WeekdayPicker.Children.Clear();
        _dayFrames.Clear();

        foreach (var (day, shortLabel, longLabel) in WeekDays)
        {
            var frame = new Frame
            {
                WidthRequest     = 44,
                HeightRequest    = 52,
                CornerRadius     = 10,
                Padding          = 0,
                HasShadow        = false,
                BackgroundColor  = Color.FromArgb("#EEF0F5"),
                BorderColor      = Color.FromArgb("#D8DBE5"),
            };

            var content = new VerticalStackLayout
            {
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions   = LayoutOptions.Center,
                Spacing           = 3,
                Children =
                {
                    new Label
                    {
                        Text                 = shortLabel,
                        FontFamily           = "OpenSansSemibold",
                        FontSize             = 13,
                        FontAttributes       = FontAttributes.Bold,
                        TextColor            = Color.FromArgb("#7A879A"),
                        HorizontalTextAlignment = TextAlignment.Center,
                    },
                    new Label
                    {
                        Text                 = longLabel,
                        FontSize             = 10,
                        TextColor            = Color.FromArgb("#7A879A"),
                        HorizontalTextAlignment = TextAlignment.Center,
                    },
                }
            };

            frame.Content = content;
            _dayFrames[day] = frame;

            var tap = new TapGestureRecognizer();
            var capturedDay = day;
            tap.Tapped += (s, e) =>
            {
                _ctrl?.ToggleDayCommand.Execute(capturedDay);
                RefreshDayButtons();
            };
            frame.GestureRecognizers.Add(tap);

            WeekdayPicker.Children.Add(frame);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Synchronisation UI ← SheetForm
    // ══════════════════════════════════════════════════════════════════

    private void SyncFormToUI()
    {
        if (_ctrl?.SheetForm == null) return;
        var form = _ctrl.SheetForm;

        // DatePicker
        if (form.SelectedDate.HasValue && DatePickerField.Date != form.SelectedDate.Value)
            DatePickerField.Date = form.SelectedDate.Value;

        // TimePickers
        if (StartTimePicker.Time != form.StartTime)
            StartTimePicker.Time = form.StartTime;
        if (EndTimePicker.Time != form.EndTime)
            EndTimePicker.Time = form.EndTime;

        // Switch récurrent
        if (RecurrentSwitch.IsToggled != form.IsRecurrent)
            RecurrentSwitch.IsToggled = form.IsRecurrent;

        RecurrentSwitch.IsEnabled = form.RecurrentEnabled;

        // Jours de la semaine
        RefreshDayButtons();
    }

    private void RefreshDayButtons()
    {
        var selectedDays = _ctrl?.SheetForm?.SelectedDays
            ?? Array.Empty<DayOfWeek>();

        foreach (var (day, frame) in _dayFrames)
        {
            bool isSelected = selectedDays.Contains(day);
            frame.BackgroundColor = isSelected
                ? Color.FromArgb("#08316e")
                : Color.FromArgb("#EEF0F5");
            frame.BorderColor = isSelected
                ? Color.FromArgb("#08316e")
                : Color.FromArgb("#D8DBE5");

            // Couleur du texte dans la frame
            foreach (var label in GetLabels(frame))
            {
                label.TextColor = isSelected ? Colors.White : Color.FromArgb("#7A879A");
            }
        }
    }

    private static IEnumerable<Label> GetLabels(Frame frame)
    {
        if (frame.Content is VerticalStackLayout layout)
            foreach (var child in layout.Children)
                if (child is Label label)
                    yield return label;
    }

    // ══════════════════════════════════════════════════════════════════
    // Animation apparition / disparition
    // ══════════════════════════════════════════════════════════════════

    protected override void OnPropertyChanged(string? propertyName = null)
    {
        base.OnPropertyChanged(propertyName);
        if (propertyName != nameof(IsVisible)) return;

        if (IsVisible)
            _ = SlideInAsync();
        else
            _ = SlideOutAsync();
    }

    private async Task SlideInAsync()
    {
        this.TranslationY = 400;
        this.Opacity      = 0;
        await Task.WhenAll(
            this.TranslateTo(0, 0, 280, Easing.CubicOut),
            this.FadeTo(1, 200));
    }

    private async Task SlideOutAsync()
    {
        await Task.WhenAll(
            this.TranslateTo(0, 400, 240, Easing.CubicIn),
            this.FadeTo(0, 180));
    }
}



