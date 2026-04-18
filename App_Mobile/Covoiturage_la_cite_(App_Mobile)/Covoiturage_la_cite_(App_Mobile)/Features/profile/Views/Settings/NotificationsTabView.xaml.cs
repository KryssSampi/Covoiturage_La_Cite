namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

public partial class NotificationsTabView : ContentView
{
    public static readonly BindableProperty EmailSectionLabelTextProperty =
        BindableProperty.Create(nameof(EmailSectionLabelText), typeof(string), typeof(NotificationsTabView), "Notifications par Email",
            propertyChanged: (b, _, n) => ((NotificationsTabView)b).EmailSectionLabel.Text = (string)n);
    public static readonly BindableProperty PushSectionLabelTextProperty =
        BindableProperty.Create(nameof(PushSectionLabelText), typeof(string), typeof(NotificationsTabView), "Notifications Push",
            propertyChanged: (b, _, n) => ((NotificationsTabView)b).PushSectionLabel.Text = (string)n);
    public static readonly BindableProperty PrimordialesLabelTextProperty =
        BindableProperty.Create(nameof(PrimordialesLabelText), typeof(string), typeof(NotificationsTabView), "Réservations et annulations",
            propertyChanged: (b, _, n) => { ((NotificationsTabView)b).PrimordialesLabel.Text = (string)n; ((NotificationsTabView)b).PushPrimordialesLabel.Text = (string)n; });
    public static readonly BindableProperty SecondairesLabelTextProperty =
        BindableProperty.Create(nameof(SecondairesLabelText), typeof(string), typeof(NotificationsTabView), "Rappels et correspondances",
            propertyChanged: (b, _, n) => { ((NotificationsTabView)b).SecondairesLabel.Text = (string)n; ((NotificationsTabView)b).PushSecondairesLabel.Text = (string)n; });
    public static readonly BindableProperty NegligeablesLabelTextProperty =
        BindableProperty.Create(nameof(NegligeablesLabelText), typeof(string), typeof(NotificationsTabView), "Conseils et promotions",
            propertyChanged: (b, _, n) => { ((NotificationsTabView)b).NegligeablesLabel.Text = (string)n; ((NotificationsTabView)b).PushNegligeablesLabel.Text = (string)n; });

    public string EmailSectionLabelText { get => (string)GetValue(EmailSectionLabelTextProperty); set => SetValue(EmailSectionLabelTextProperty, value); }
    public string PushSectionLabelText { get => (string)GetValue(PushSectionLabelTextProperty); set => SetValue(PushSectionLabelTextProperty, value); }
    public string PrimordialesLabelText { get => (string)GetValue(PrimordialesLabelTextProperty); set => SetValue(PrimordialesLabelTextProperty, value); }
    public string SecondairesLabelText { get => (string)GetValue(SecondairesLabelTextProperty); set => SetValue(SecondairesLabelTextProperty, value); }
    public string NegligeablesLabelText { get => (string)GetValue(NegligeablesLabelTextProperty); set => SetValue(NegligeablesLabelTextProperty, value); }

    public NotificationsTabView() => InitializeComponent();
}
