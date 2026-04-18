using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;
using System.Windows.Input;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

public partial class ProfileTabView : ContentView
{
    public static readonly BindableProperty DescriptionTextProperty = BindableProperty.Create(nameof(DescriptionText), typeof(string), typeof(ProfileTabView));
    public static readonly BindableProperty MeProperty = BindableProperty.Create(nameof(Me), typeof(MeDisplayModel), typeof(ProfileTabView));
    public static readonly BindableProperty SaveCommandProperty = BindableProperty.Create(nameof(SaveCommand), typeof(ICommand), typeof(ProfileTabView));
    public static readonly BindableProperty AddLanguageCommandProperty = BindableProperty.Create(nameof(AddLanguageCommand), typeof(ICommand), typeof(ProfileTabView));

    public string DescriptionText
    {
        get => (string)GetValue(DescriptionTextProperty);
        set => SetValue(DescriptionTextProperty, value);
    }

    public MeDisplayModel Me
    {
        get => (MeDisplayModel)GetValue(MeProperty);
        set => SetValue(MeProperty, value);
    }

    public ICommand SaveCommand
    {
        get => (ICommand)GetValue(SaveCommandProperty);
        set => SetValue(SaveCommandProperty, value);
    }

    public ICommand AddLanguageCommand
    {
        get => (ICommand)GetValue(AddLanguageCommandProperty);
        set => SetValue(AddLanguageCommandProperty, value);
    }

    public ProfileTabView()
    {
        InitializeComponent();
        BindingContext = this;
    }

    private void OnSchoolRoleChanged(object sender, EventArgs e)
    {
        // Handle picker change, update Me.SchoolRole
        if (SchoolRolePicker.SelectedItem is SchoolRole role)
        {
            Me.SchoolRole = role;
        }
    }

    private void OnLanguageAdded(object sender, EventArgs e)
    {
        AddLanguageCommand?.Execute(AddLanguagePicker.SelectedItem);
    }
}
