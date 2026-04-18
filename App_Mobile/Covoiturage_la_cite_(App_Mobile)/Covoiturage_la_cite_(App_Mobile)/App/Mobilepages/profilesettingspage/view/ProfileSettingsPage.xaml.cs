using Microsoft.Maui.Controls;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilesettingspage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilesettingspage.view;

public partial class ProfileSettingsPage : ContentPage
{
    private readonly ProfileSettingsPageDisplayControler _pageController;

    public ProfileSettingsPage(ProfileSettingsPageDisplayControler pageController)
    {
        InitializeComponent();
        _pageController = pageController;
        BindingContext = _pageController;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _pageController.InitializeAsync();
        UpdateTabContent("profile");
    }

    private void NavigateToTab(object sender, EventArgs e)
    {
        if (sender is Button btn)
            UpdateTabContent(btn.ClassId ?? btn.Text?.ToLower().Replace(" ", ""));
    }

    private void UpdateTabContent(string? tabName)
    {
        TabContentHost.Content = tabName switch
        {
            "profile"       => _pageController.BuildProfileTabView(),
            "vehicle"       => _pageController.BuildVehicleTabView(),
            "tripambiance"  => _pageController.BuildTripAmbianceTabView(),
            "notifications" => _pageController.BuildNotificationsTabView(),
            "privacy"       => _pageController.BuildPrivacyTabView(),
            "visibility"    => _pageController.BuildVisibilityTabView(),
            "searchprefs"   => _pageController.BuildSearchPrefsTabView(),
            "accessibility" => _pageController.BuildAccessibilityTabView(),
            _               => _pageController.BuildProfileTabView()
        };
    }
}
