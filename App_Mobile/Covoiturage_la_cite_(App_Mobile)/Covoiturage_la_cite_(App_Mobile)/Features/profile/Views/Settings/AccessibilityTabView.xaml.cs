using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

public partial class AccessibilityTabView : ContentView
{
    public AccessibilityTabView() => InitializeComponent();

    private void OnFontSizeChanged(object? sender, EventArgs e)
    {
        if (BindingContext is AccessibilityDisplayModel dm && FontSizePicker.SelectedIndex >= 0)
        {
            dm.FontSize = FontSizePicker.SelectedIndex switch { 0 => "small", 2 => "large", _ => "medium" };
        }
    }
}
