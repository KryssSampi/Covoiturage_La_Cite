using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

public partial class TripAmbianceTabView : ContentView
{
    public static readonly BindableProperty DescriptionTextProperty =
        BindableProperty.Create(nameof(DescriptionText), typeof(string), typeof(TripAmbianceTabView), string.Empty,
            propertyChanged: (b, _, n) => ((TripAmbianceTabView)b).DescriptionLabel.Text = (string)n);
    public static readonly BindableProperty TalkLabelTextProperty =
        BindableProperty.Create(nameof(TalkLabelText), typeof(string), typeof(TripAmbianceTabView), "Parler",
            propertyChanged: (b, _, n) => ((TripAmbianceTabView)b).TalkLabel.Text = (string)n);
    public static readonly BindableProperty MusicLabelTextProperty =
        BindableProperty.Create(nameof(MusicLabelText), typeof(string), typeof(TripAmbianceTabView), "Musique",
            propertyChanged: (b, _, n) => ((TripAmbianceTabView)b).MusicLabel.Text = (string)n);
    public static readonly BindableProperty PetsLabelTextProperty =
        BindableProperty.Create(nameof(PetsLabelText), typeof(string), typeof(TripAmbianceTabView), "Animaux",
            propertyChanged: (b, _, n) => ((TripAmbianceTabView)b).PetsLabel.Text = (string)n);
    public static readonly BindableProperty SmokeLabelTextProperty =
        BindableProperty.Create(nameof(SmokeLabelText), typeof(string), typeof(TripAmbianceTabView), "Fumer",
            propertyChanged: (b, _, n) => ((TripAmbianceTabView)b).SmokeLabel.Text = (string)n);

    public static readonly BindableProperty ToggleTalkCommandProperty =
        BindableProperty.Create(nameof(ToggleTalkCommand), typeof(Command), typeof(TripAmbianceTabView));
    public static readonly BindableProperty ToggleMusicCommandProperty =
        BindableProperty.Create(nameof(ToggleMusicCommand), typeof(Command), typeof(TripAmbianceTabView));
    public static readonly BindableProperty TogglePetsCommandProperty =
        BindableProperty.Create(nameof(TogglePetsCommand), typeof(Command), typeof(TripAmbianceTabView));
    public static readonly BindableProperty ToggleSmokeCommandProperty =
        BindableProperty.Create(nameof(ToggleSmokeCommand), typeof(Command), typeof(TripAmbianceTabView));

    public string DescriptionText { get => (string)GetValue(DescriptionTextProperty); set => SetValue(DescriptionTextProperty, value); }
    public string TalkLabelText { get => (string)GetValue(TalkLabelTextProperty); set => SetValue(TalkLabelTextProperty, value); }
    public string MusicLabelText { get => (string)GetValue(MusicLabelTextProperty); set => SetValue(MusicLabelTextProperty, value); }
    public string PetsLabelText { get => (string)GetValue(PetsLabelTextProperty); set => SetValue(PetsLabelTextProperty, value); }
    public string SmokeLabelText { get => (string)GetValue(SmokeLabelTextProperty); set => SetValue(SmokeLabelTextProperty, value); }
    public Command? ToggleTalkCommand { get => (Command?)GetValue(ToggleTalkCommandProperty); set => SetValue(ToggleTalkCommandProperty, value); }
    public Command? ToggleMusicCommand { get => (Command?)GetValue(ToggleMusicCommandProperty); set => SetValue(ToggleMusicCommandProperty, value); }
    public Command? TogglePetsCommand { get => (Command?)GetValue(TogglePetsCommandProperty); set => SetValue(TogglePetsCommandProperty, value); }
    public Command? ToggleSmokeCommand { get => (Command?)GetValue(ToggleSmokeCommandProperty); set => SetValue(ToggleSmokeCommandProperty, value); }

    public TripAmbianceTabView() => InitializeComponent();

    private void OnTalkToggled(object? s, ToggledEventArgs e) => ToggleTalkCommand?.Execute(null);
    private void OnMusicToggled(object? s, ToggledEventArgs e) => ToggleMusicCommand?.Execute(null);
    private void OnPetsToggled(object? s, ToggledEventArgs e) => TogglePetsCommand?.Execute(null);
    private void OnSmokeToggled(object? s, ToggledEventArgs e) => ToggleSmokeCommand?.Execute(null);
}
