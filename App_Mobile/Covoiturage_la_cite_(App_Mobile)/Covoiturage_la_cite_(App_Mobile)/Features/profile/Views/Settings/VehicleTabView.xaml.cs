using System.Collections.ObjectModel;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

public partial class VehicleTabView : ContentView
{
    private static BindableProperty Bp(string name, string def) =>
        BindableProperty.Create(name, typeof(string), typeof(VehicleTabView), def);

    public static readonly BindableProperty NoVehicleLabelProperty = Bp(nameof(NoVehicleLabel), "Aucun véhicule enregistré");
    public static readonly BindableProperty NoVehicleDescLabelProperty = Bp(nameof(NoVehicleDescLabel), "Ajoutez un véhicule pour publier des trajets.");
    public static readonly BindableProperty AddVehicleLabelProperty = Bp(nameof(AddVehicleLabel), "Ajouter un véhicule");
    public static readonly BindableProperty SaveButtonLabelProperty = Bp(nameof(SaveButtonLabel), "Enregistrer");
    public static readonly BindableProperty MakeLabelProperty = Bp(nameof(MakeLabel), "Marque");
    public static readonly BindableProperty ModelLabelProperty = Bp(nameof(ModelLabel), "Modèle");
    public static readonly BindableProperty YearLabelProperty = Bp(nameof(YearLabel), "Année");
    public static readonly BindableProperty ColorLabelProperty = Bp(nameof(ColorLabel), "Couleur");
    public static readonly BindableProperty SeatsLabelProperty = Bp(nameof(SeatsLabel), "Places passagers");
    public static readonly BindableProperty ToggleActiveLabelProperty = Bp(nameof(ToggleActiveLabel), "Véhicule actif");
    public static readonly BindableProperty YourVehiclesLabelProperty = Bp(nameof(YourVehiclesLabel), "Vos véhicules");
    public static readonly BindableProperty DocumentsListLabelProperty = Bp(nameof(DocumentsListLabel), "Pièces attendues");
    public static readonly BindableProperty UploadDocsLabelProperty = Bp(nameof(UploadDocsLabel), "Téléverser les documents");

    public static readonly BindableProperty HasVehicleProperty =
        BindableProperty.Create(nameof(HasVehicle), typeof(bool), typeof(VehicleTabView), false, propertyChanged: OnHasVehicleChanged);
    public static readonly BindableProperty HasNoVehicleProperty =
        BindableProperty.Create(nameof(HasNoVehicle), typeof(bool), typeof(VehicleTabView), true);
    public static readonly BindableProperty VehiclesProperty =
        BindableProperty.Create(nameof(Vehicles), typeof(ObservableCollection<VehicleDisplayModel>), typeof(VehicleTabView), null,
            propertyChanged: (b, _, n) => ((VehicleTabView)b).RefreshVehicleCards((ObservableCollection<VehicleDisplayModel>)n));
    public static readonly BindableProperty MakeOptionsProperty =
        BindableProperty.Create(nameof(MakeOptions), typeof(List<string>), typeof(VehicleTabView), new List<string>(),
            propertyChanged: (b, _, n) => ((VehicleTabView)b).MakePicker.ItemsSource = (List<string>)n);
    public static readonly BindableProperty ModelOptionsProperty =
        BindableProperty.Create(nameof(ModelOptions), typeof(List<string>), typeof(VehicleTabView), new List<string>(),
            propertyChanged: (b, _, n) => ((VehicleTabView)b).ModelPicker.ItemsSource = (List<string>)n);
    public static readonly BindableProperty YearOptionsProperty =
        BindableProperty.Create(nameof(YearOptions), typeof(List<string>), typeof(VehicleTabView), new List<string>(),
            propertyChanged: (b, _, n) => ((VehicleTabView)b).YearPicker.ItemsSource = (List<string>)n);
    public static readonly BindableProperty ColorOptionsProperty =
        BindableProperty.Create(nameof(ColorOptions), typeof(List<string>), typeof(VehicleTabView), new List<string>(),
            propertyChanged: (b, _, n) => ((VehicleTabView)b).ColorPicker.ItemsSource = (List<string>)n);
    public static readonly BindableProperty SeatsOptionsProperty =
        BindableProperty.Create(nameof(SeatsOptions), typeof(List<string>), typeof(VehicleTabView), new List<string>(),
            propertyChanged: (b, _, n) => ((VehicleTabView)b).SeatsPicker.ItemsSource = (List<string>)n);

    public static readonly BindableProperty AddVehicleCommandProperty = BindableProperty.Create(nameof(AddVehicleCommand), typeof(Command), typeof(VehicleTabView));
    public static readonly BindableProperty SaveCommandProperty = BindableProperty.Create(nameof(SaveCommand), typeof(Command), typeof(VehicleTabView));
    public static readonly BindableProperty UploadDocumentsCommandProperty = BindableProperty.Create(nameof(UploadDocumentsCommand), typeof(Command), typeof(VehicleTabView));
    public static readonly BindableProperty ToggleActiveCommandProperty = BindableProperty.Create(nameof(ToggleActiveCommand), typeof(Command), typeof(VehicleTabView));
    public static readonly BindableProperty SelectVehicleCommandProperty = BindableProperty.Create(nameof(SelectVehicleCommand), typeof(Command<string>), typeof(VehicleTabView));
    public static readonly BindableProperty MakeChangedCommandProperty = BindableProperty.Create(nameof(MakeChangedCommand), typeof(Command<string>), typeof(VehicleTabView));
    public static readonly BindableProperty ModelChangedCommandProperty = BindableProperty.Create(nameof(ModelChangedCommand), typeof(Command<string>), typeof(VehicleTabView));
    public static readonly BindableProperty YearChangedCommandProperty = BindableProperty.Create(nameof(YearChangedCommand), typeof(Command<string>), typeof(VehicleTabView));
    public static readonly BindableProperty ColorChangedCommandProperty = BindableProperty.Create(nameof(ColorChangedCommand), typeof(Command<string>), typeof(VehicleTabView));
    public static readonly BindableProperty SeatsChangedCommandProperty = BindableProperty.Create(nameof(SeatsChangedCommand), typeof(Command<string>), typeof(VehicleTabView));

    public string NoVehicleLabel { get => (string)GetValue(NoVehicleLabelProperty); set => SetValue(NoVehicleLabelProperty, value); }
    public string NoVehicleDescLabel { get => (string)GetValue(NoVehicleDescLabelProperty); set => SetValue(NoVehicleDescLabelProperty, value); }
    public string AddVehicleLabel { get => (string)GetValue(AddVehicleLabelProperty); set => SetValue(AddVehicleLabelProperty, value); }
    public string SaveButtonLabel { get => (string)GetValue(SaveButtonLabelProperty); set => SetValue(SaveButtonLabelProperty, value); }
    public string MakeLabel { get => (string)GetValue(MakeLabelProperty); set => SetValue(MakeLabelProperty, value); }
    public string ModelLabel { get => (string)GetValue(ModelLabelProperty); set => SetValue(ModelLabelProperty, value); }
    public string YearLabel { get => (string)GetValue(YearLabelProperty); set => SetValue(YearLabelProperty, value); }
    public string ColorLabel { get => (string)GetValue(ColorLabelProperty); set => SetValue(ColorLabelProperty, value); }
    public string SeatsLabel { get => (string)GetValue(SeatsLabelProperty); set => SetValue(SeatsLabelProperty, value); }
    public string ToggleActiveLabel { get => (string)GetValue(ToggleActiveLabelProperty); set => SetValue(ToggleActiveLabelProperty, value); }
    public string YourVehiclesLabel { get => (string)GetValue(YourVehiclesLabelProperty); set => SetValue(YourVehiclesLabelProperty, value); }
    public string DocumentsListLabel { get => (string)GetValue(DocumentsListLabelProperty); set => SetValue(DocumentsListLabelProperty, value); }
    public string UploadDocsLabel { get => (string)GetValue(UploadDocsLabelProperty); set => SetValue(UploadDocsLabelProperty, value); }
    public bool HasVehicle { get => (bool)GetValue(HasVehicleProperty); set => SetValue(HasVehicleProperty, value); }
    public bool HasNoVehicle { get => (bool)GetValue(HasNoVehicleProperty); set => SetValue(HasNoVehicleProperty, value); }
    public ObservableCollection<VehicleDisplayModel>? Vehicles { get => (ObservableCollection<VehicleDisplayModel>?)GetValue(VehiclesProperty); set => SetValue(VehiclesProperty, value); }
    public List<string> MakeOptions { get => (List<string>)GetValue(MakeOptionsProperty); set => SetValue(MakeOptionsProperty, value); }
    public List<string> ModelOptions { get => (List<string>)GetValue(ModelOptionsProperty); set => SetValue(ModelOptionsProperty, value); }
    public List<string> YearOptions { get => (List<string>)GetValue(YearOptionsProperty); set => SetValue(YearOptionsProperty, value); }
    public List<string> ColorOptions { get => (List<string>)GetValue(ColorOptionsProperty); set => SetValue(ColorOptionsProperty, value); }
    public List<string> SeatsOptions { get => (List<string>)GetValue(SeatsOptionsProperty); set => SetValue(SeatsOptionsProperty, value); }
    public Command? AddVehicleCommand { get => (Command?)GetValue(AddVehicleCommandProperty); set => SetValue(AddVehicleCommandProperty, value); }
    public Command? SaveCommand { get => (Command?)GetValue(SaveCommandProperty); set => SetValue(SaveCommandProperty, value); }
    public Command? UploadDocumentsCommand { get => (Command?)GetValue(UploadDocumentsCommandProperty); set => SetValue(UploadDocumentsCommandProperty, value); }
    public Command? ToggleActiveCommand { get => (Command?)GetValue(ToggleActiveCommandProperty); set => SetValue(ToggleActiveCommandProperty, value); }
    public Command<string>? SelectVehicleCommand { get => (Command<string>?)GetValue(SelectVehicleCommandProperty); set => SetValue(SelectVehicleCommandProperty, value); }
    public Command<string>? MakeChangedCommand { get => (Command<string>?)GetValue(MakeChangedCommandProperty); set => SetValue(MakeChangedCommandProperty, value); }
    public Command<string>? ModelChangedCommand { get => (Command<string>?)GetValue(ModelChangedCommandProperty); set => SetValue(ModelChangedCommandProperty, value); }
    public Command<string>? YearChangedCommand { get => (Command<string>?)GetValue(YearChangedCommandProperty); set => SetValue(YearChangedCommandProperty, value); }
    public Command<string>? ColorChangedCommand { get => (Command<string>?)GetValue(ColorChangedCommandProperty); set => SetValue(ColorChangedCommandProperty, value); }
    public Command<string>? SeatsChangedCommand { get => (Command<string>?)GetValue(SeatsChangedCommandProperty); set => SetValue(SeatsChangedCommandProperty, value); }

    public VehicleTabView() => InitializeComponent();

    private static void OnHasVehicleChanged(BindableObject b, object o, object n)
    {
        if (b is VehicleTabView v)
        {
            v.NoVehicleSection.IsVisible = !(bool)n;
            v.VehicleFormSection.IsVisible = (bool)n;
        }
    }

    private void OnAddVehicle(object? s, EventArgs e) => AddVehicleCommand?.Execute(null);
    private void OnSave(object? s, EventArgs e) => SaveCommand?.Execute(null);
    private void OnUploadDocuments(object? s, EventArgs e) => UploadDocumentsCommand?.Execute(null);
    private void OnVehicleActiveToggled(object? s, ToggledEventArgs e) => ToggleActiveCommand?.Execute(null);
    private void OnMakeChanged(object? s, EventArgs e) { if (MakePicker.SelectedItem is string v) MakeChangedCommand?.Execute(v); }
    private void OnModelChanged(object? s, EventArgs e) { if (ModelPicker.SelectedItem is string v) ModelChangedCommand?.Execute(v); }
    private void OnYearChanged(object? s, EventArgs e) { if (YearPicker.SelectedItem is string v) YearChangedCommand?.Execute(v); }
    private void OnColorChanged(object? s, EventArgs e) { if (ColorPicker.SelectedItem is string v) ColorChangedCommand?.Execute(v); }
    private void OnSeatsChanged(object? s, EventArgs e) { if (SeatsPicker.SelectedItem is string v) SeatsChangedCommand?.Execute(v); }

    private void RefreshVehicleCards(ObservableCollection<VehicleDisplayModel> vehicles)
    {
        while (VehiclesScrollLayout.Children.Count > 1)
            VehiclesScrollLayout.Children.RemoveAt(1);

        foreach (var v in vehicles)
        {
            var id = v.Id;
            var card = new Frame
            {
                WidthRequest = 90, HeightRequest = 80, CornerRadius = 12, HasShadow = false,
                BackgroundColor = v.IsActive ? Color.FromArgb("#E8F0FE") : Color.FromArgb("#F8F9FC"),
                BorderColor = v.IsActive ? Color.FromArgb("#1A56CC") : Color.FromArgb("#D8DBE5"),
                Padding = new Thickness(6),
                Content = new VerticalStackLayout
                {
                    HorizontalOptions = LayoutOptions.Center, VerticalOptions = LayoutOptions.Center, Spacing = 2,
                    Children =
                    {
                        new Label { Text = v.Make, FontSize = 10, TextColor = Color.FromArgb("#545D6E"), HorizontalOptions = LayoutOptions.Center },
                        new Label { Text = v.Model, FontSize = 10, TextColor = Color.FromArgb("#545D6E"), HorizontalOptions = LayoutOptions.Center }
                    }
                }
            };
            card.GestureRecognizers.Add(new TapGestureRecognizer { Command = SelectVehicleCommand, CommandParameter = id });
            VehiclesScrollLayout.Children.Add(card);
        }
    }
}
