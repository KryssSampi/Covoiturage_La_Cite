using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Services;
using Covoiturage_la_cite__App_Mobile_.Features.profile.Views.Settings;
using Covoiturage_la_cite__App_Mobile_.Services.language;
using System.Collections.ObjectModel;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayControler;

public partial class ProfileSettingsDisplayControler : ObservableObject
{
    private readonly IProfileService _profileService;
    private readonly IVehicleService _vehicleService;
    private readonly ILanguageService _languageService;

    [ObservableProperty] private ProfileSettingsPageDisplayModel _displayModel = new();
    [ObservableProperty] private bool _isInitialLoading;
    [ObservableProperty] private string _currentTab = "profile";
    [ObservableProperty] private string? _toastMessage;
    [ObservableProperty] private bool _showToast;

    public string PageTitle => _languageService.IsFrench ? "Paramètres du profil" : "Profile Settings";
    public bool IsFrench => _languageService.IsFrench;

    public ProfileSettingsDisplayControler(
        IProfileService profileService,
        IVehicleService vehicleService,
        ILanguageService languageService)
    {
        _profileService = profileService;
        _vehicleService = vehicleService;
        _languageService = languageService;
    }

    public async Task InitializeAsync()
    {
        IsInitialLoading = true;
        try
        {
            var meTask = _profileService.GetMeAsync();
            var vehiclesTask = _vehicleService.GetMyVehiclesAsync();
            await Task.WhenAll(meTask, vehiclesTask);

            var me = await meTask;
            DisplayModel.Me = MapMeToDisplayModel(me);

            var vehicles = await vehiclesTask;
            MapVehiclesToDisplayModel(vehicles);

            var prefs = await _profileService.GetPreferencesAsync();
            MapPreferencesToDisplayModel(prefs);
        }
        catch (Exception ex)
        {
            ShowToastMessage(ex.Message);
        }
        finally
        {
            IsInitialLoading = false;
        }
    }

    [RelayCommand]
    private void NavigateToTab(string tabName) => CurrentTab = tabName;

    [RelayCommand]
    private async Task SaveAllAsync()
    {
        if (!DisplayModel.HasUnsavedChanges) return;
        DisplayModel.IsSaving = true;
        try
        {
            await _profileService.UpdateMeAsync(BuildMeRequest());
            await _profileService.UpdatePreferencesAsync(BuildPrefsRequest());
            DisplayModel.HasUnsavedChanges = false;
            ShowToastMessage(IsFrench ? "Modifications enregistrées ✓" : "Changes saved ✓");
        }
        catch (Exception ex)
        {
            ShowToastMessage(ex.Message);
        }
        finally { DisplayModel.IsSaving = false; }
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        await _profileService.LogoutAsync();
        await Shell.Current.GoToAsync("//login");
    }

    private void ShowToastMessage(string msg)
    {
        ToastMessage = msg;
        ShowToast = true;
        Task.Delay(3000).ContinueWith(_ =>
            MainThread.BeginInvokeOnMainThread(() => ShowToast = false));
    }

    private MeDisplayModel MapMeToDisplayModel(MeDto dto) => new()
    {
        Id = dto.Id,
        Email = dto.Email,
        FirstName = dto.FirstName,
        LastName = dto.LastName,
        Phone = dto.Phone,
        AvatarUrl = dto.AvatarUrl,
        Bio = dto.Bio,
        NotificationEmail = dto.NotificationEmail,
        Role = dto.Role,
        LanguagesSpoken = new ObservableCollection<string>(dto.LanguagesSpoken ?? new List<string>()),
        SchoolRole = Enum.TryParse<SchoolRole>(dto.SchoolRole, true, out var sr) ? sr : SchoolRole.Etudiant
    };

    private void MapVehiclesToDisplayModel(IEnumerable<VehicleDto> vehicles)
    {
        DisplayModel.Vehicles.Clear();
        foreach (var v in vehicles)
        {
            var vdm = new VehicleDisplayModel
            {
                Id = v.Id, Make = v.Make, Model = v.Model, Year = v.Year,
                Color = v.Color, LicensePlate = v.LicensePlate,
                MaxSeats = v.MaxSeats, PassengerSeats = v.MaxSeats - 1,
                PhotoUrl = v.PhotoUrl, IsActive = v.IsActive,
                IsValidated = v.IsValidated,
                AdminRequestDocuments = v.AdminRequestDocuments ?? false,
                StatusLabel = v.IsActive ? (IsFrench ? "Actif" : "Active") : (IsFrench ? "Inactif" : "Inactive")
            };
            DisplayModel.Vehicles.Add(vdm);
            if (v.IsActive) DisplayModel.ActiveVehicle = vdm;
        }
        if (DisplayModel.ActiveVehicle is null && DisplayModel.Vehicles.Any())
            DisplayModel.ActiveVehicle = DisplayModel.Vehicles.First();
    }

    private void MapPreferencesToDisplayModel(PreferencesDto p)
    {
        DisplayModel.TripAmbiance.MusicAccepted = p.MusicAccepted;
        DisplayModel.TripAmbiance.PetsAccepted = p.PetsAccepted;
        DisplayModel.TripAmbiance.SmokingAccepted = p.SmokingAccepted;
        DisplayModel.TripAmbiance.ConversationLevel = Enum.TryParse<ConversationLevel>(p.ConversationLevel, true, out var cl) ? cl : ConversationLevel.Moderate;
        DisplayModel.Notifications.EmailPrimordiales = p.EmailPrimordiales;
        DisplayModel.Notifications.EmailSecondaires = p.EmailSecondaires;
        DisplayModel.Notifications.EmailNegligeables = p.EmailNegligeables;
        DisplayModel.Notifications.PushPrimordiales = p.PushPrimordiales;
        DisplayModel.Notifications.PushSecondaires = p.PushSecondaires;
        DisplayModel.Notifications.PushNegligeables = p.PushNegligeables;
        DisplayModel.Privacy.ShowPhoneNumber = p.ShowPhoneNumber;
        DisplayModel.Privacy.ShowLastName = p.ShowLastName;
        DisplayModel.Privacy.AllowAffinityTracking = p.AllowAffinityTracking;
        DisplayModel.Visibility.GoScore = p.VisibilityGoScore;
        DisplayModel.Visibility.TripsCount = p.VisibilityTripsCount;
        DisplayModel.Visibility.GlobalRating = p.VisibilityGlobalRating;
        DisplayModel.Visibility.Co2Saved = p.VisibilityCo2Saved;
        DisplayModel.SearchPrefs.DefaultDepartureRadiusMeters = p.DefaultDepartureRadiusMeters;
        DisplayModel.SearchPrefs.DefaultArrivalRadiusMeters = p.DefaultArrivalRadiusMeters;
        DisplayModel.SearchPrefs.DefaultTimeToleranceMinutes = p.DefaultTimeToleranceMinutes;
        DisplayModel.SearchPrefs.DefaultMaxPrice = p.DefaultMaxPrice;
        DisplayModel.SearchPrefs.RequireVerifiedDriver = p.RequireVerifiedDriver;
        DisplayModel.SearchPrefs.MinDriverGoScore = p.MinDriverGoScore;
        DisplayModel.SearchPrefs.MinDriverRating = p.MinDriverRating;
        DisplayModel.SearchPrefs.MinPassengerGoScore = p.MinPassengerGoScore;
        DisplayModel.SearchPrefs.RequirePassengerMessage = p.RequirePassengerMessage;
    }

    private UpdateMeRequest BuildMeRequest() => new(
        DisplayModel.Me.FirstName, DisplayModel.Me.LastName,
        DisplayModel.Me.Phone, DisplayModel.Me.Bio,
        DisplayModel.Me.NotificationEmail,
        DisplayModel.Me.SchoolRole.ToString().ToLower(),
        DisplayModel.Me.LanguagesSpoken.ToList());

    private UpdatePreferencesRequest BuildPrefsRequest() => new(
        DisplayModel.TripAmbiance.MusicAccepted, DisplayModel.TripAmbiance.PetsAccepted,
        DisplayModel.TripAmbiance.SmokingAccepted, DisplayModel.TripAmbiance.ConversationLevel.ToString().ToLower(),
        DisplayModel.Notifications.EmailPrimordiales, DisplayModel.Notifications.EmailSecondaires, DisplayModel.Notifications.EmailNegligeables,
        DisplayModel.Notifications.PushPrimordiales, DisplayModel.Notifications.PushSecondaires, DisplayModel.Notifications.PushNegligeables,
        DisplayModel.Privacy.ShowPhoneNumber, DisplayModel.Privacy.ShowLastName, DisplayModel.Privacy.AllowAffinityTracking,
        DisplayModel.Visibility.GoScore, DisplayModel.Visibility.TripsCount, DisplayModel.Visibility.GlobalRating, DisplayModel.Visibility.Co2Saved,
        DisplayModel.SearchPrefs.DefaultDepartureRadiusMeters, DisplayModel.SearchPrefs.DefaultArrivalRadiusMeters,
        DisplayModel.SearchPrefs.DefaultTimeToleranceMinutes, DisplayModel.SearchPrefs.DefaultMaxPrice,
        DisplayModel.SearchPrefs.RequireVerifiedDriver, DisplayModel.SearchPrefs.MinDriverGoScore,
        DisplayModel.SearchPrefs.MinDriverRating, DisplayModel.SearchPrefs.MinPassengerGoScore,
        DisplayModel.SearchPrefs.RequirePassengerMessage);
}
