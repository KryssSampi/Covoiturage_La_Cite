using Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayControler;

public partial class ProfileSettingsDisplayControler
{
    public ProfileTabView BuildProfileTabView()
    {
        var view = new ProfileTabView();
        // Configure view with DisplayModel.Me, commands, etc.
        return view;
    }

    public VehicleTabView BuildVehicleTabView()
    {
        var view = new VehicleTabView();
        // Configure
        return view;
    }

    public TripAmbianceTabView BuildTripAmbianceTabView()
    {
        var view = new TripAmbianceTabView();
        // Configure with DisplayModel.TripAmbiance
        return view;
    }

    // Implement all 8 Build*TabView factory methods...
    public NotificationsTabView BuildNotificationsTabView() => new NotificationsTabView();
    public PrivacyTabView BuildPrivacyTabView() => new PrivacyTabView();
    public VisibilityTabView BuildVisibilityTabView() => new VisibilityTabView();
    public SearchPrefsTabView BuildSearchPrefsTabView() => new SearchPrefsTabView();
    public AccessibilityTabView BuildAccessibilityTabView() => new AccessibilityTabView();
}
