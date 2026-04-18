using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Services;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Views.PublicProfile;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayControler;

public partial class PublicProfileDisplayControler : ObservableObject
{
    private readonly IProfileService _profileService;
    private readonly IFavoritesService _favoritesService;

    [ObservableProperty] private PublicProfilePageDisplayModel _displayModel = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _currentSection = "stats";
    [ObservableProperty] private bool _isFavorite;

    private string? _currentUserId;

    public string StatsSectionTitle => "Statistiques";
    public string ReviewsSectionTitle => "Avis";
    public string TripsSectionTitle => "Trajets publiés";
    public string RecurringTripsSectionTitle => "Trajets habituels";
    public string FavoriteButtonLabel => IsFavorite ? "Retirer des favoris" : "Ajouter aux favoris";

    public PublicProfileDisplayControler(IProfileService profileService, IFavoritesService favoritesService)
    {
        _profileService = profileService;
        _favoritesService = favoritesService;
    }

    public async Task InitializeAsync(string userId)
    {
        _currentUserId = userId;
        IsLoading = true;
        try
        {
            var dto = await _profileService.GetPublicProfileAsync(userId);
            DisplayModel.UserPublic = new UserPublicDisplayModel
            {
                Id = dto.Id,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Bio = dto.Bio,
                SchoolRole = dto.SchoolRole,
                JoinDate = dto.CreatedAt,
                GoScore = dto.GoScore,
            };
            IsFavorite = dto.IsFavorite;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task ToggleFavoriteAsync()
    {
        if (_currentUserId is null) return;
        IsFavorite = !IsFavorite;
        if (IsFavorite)
            await _favoritesService.AddUserFavoriteAsync(_currentUserId);
        else
            await _favoritesService.RemoveUserFavoriteAsync(_currentUserId);
    }

    [RelayCommand]
    private void NavigateToSection(string section) => CurrentSection = section;

    // Factory methods — retournent des vues placeholder connectées au DisplayModel
    public ProfileHeaderView BuildHeaderView()
    {
        var view = new ProfileHeaderView();
        view.BindingContext = DisplayModel.UserPublic;
        return view;
    }

    public View BuildStatsSectionView() => new ProfileStatsSectionView { BindingContext = DisplayModel };
    public View BuildReviewsSectionView() => new ProfileReviewsSectionView { BindingContext = DisplayModel };
    public View BuildPublishedTripsSectionView() => new ProfilePublishedTripsSectionView { BindingContext = DisplayModel };
    public View BuildRecurringTripsSectionView() => new ProfileRecurringTripsSectionView { BindingContext = DisplayModel };
}
