using CommunityToolkit.Mvvm.ComponentModel;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilesettingspage.DisplayControler;

public partial class ProfileSettingsPageDisplayControler : ObservableObject
{
    public ProfileSettingsDisplayControler ProfileFeature { get; }

    public ProfileSettingsPageDisplayControler(ProfileSettingsDisplayControler feature)
    {
        ProfileFeature = feature;
    }

    public Task InitializeAsync() => ProfileFeature.InitializeAsync();

    // Délégation des factory methods
    public ProfileTabView BuildProfileTabView() => ProfileFeature.BuildProfileTabView();
    public TripAmbianceTabView BuildTripAmbianceTabView() => ProfileFeature.BuildTripAmbianceTabView();
    public NotificationsTabView BuildNotificationsTabView() => ProfileFeature.BuildNotificationsTabView();
    public VehicleTabView BuildVehicleTabView() => ProfileFeature.BuildVehicleTabView();
    public PrivacyTabView BuildPrivacyTabView() => ProfileFeature.BuildPrivacyTabView();
    public VisibilityTabView BuildVisibilityTabView() => ProfileFeature.BuildVisibilityTabView();
    public SearchPrefsTabView BuildSearchPrefsTabView() => ProfileFeature.BuildSearchPrefsTabView();
    public AccessibilityTabView BuildAccessibilityTabView() => ProfileFeature.BuildAccessibilityTabView();
}
