using CommunityToolkit.Mvvm.ComponentModel;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Views.PublicProfile;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.publicprofilepage.DisplayControler;

public partial class PublicProfilePageDisplayControler : ObservableObject
{
    public PublicProfileDisplayControler PublicProfileFeature { get; }

    public PublicProfilePageDisplayControler(PublicProfileDisplayControler feature)
    {
        PublicProfileFeature = feature;
    }

    public Task InitializeAsync(string userId) => PublicProfileFeature.InitializeAsync(userId);

    // Délégation des factory methods vues
    public ProfileHeaderView BuildHeaderView() => PublicProfileFeature.BuildHeaderView();
    public View BuildStatsSectionView() => PublicProfileFeature.BuildStatsSectionView();
    public View BuildReviewsSectionView() => PublicProfileFeature.BuildReviewsSectionView();
    public View BuildPublishedTripsSectionView() => PublicProfileFeature.BuildPublishedTripsSectionView();
    public View BuildRecurringTripsSectionView() => PublicProfileFeature.BuildRecurringTripsSectionView();

    // Exposer les labels i18n et le DisplayModel pour la vue
    public string StatsSectionTitle => PublicProfileFeature.StatsSectionTitle;
    public string ReviewsSectionTitle => PublicProfileFeature.ReviewsSectionTitle;
    public string TripsSectionTitle => PublicProfileFeature.TripsSectionTitle;
    public string RecurringTripsSectionTitle => PublicProfileFeature.RecurringTripsSectionTitle;
    public string FavoriteButtonLabel => PublicProfileFeature.FavoriteButtonLabel;
    public bool IsLoading => PublicProfileFeature.IsLoading;
    public PublicProfilePageDisplayModel DisplayModel => PublicProfileFeature.DisplayModel;
}
