using CommunityToolkit.Mvvm.ComponentModel;
using System.Collections.ObjectModel;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;

public enum SchoolRole { Etudiant, Enseignant, Staff }
public enum ConversationLevel { Silent, Moderate, Talkative }

public partial class BadgeDisplayModel : ObservableObject
{
    [ObservableProperty] private string _key = "";
    [ObservableProperty] private string _titleFr = "";
    [ObservableProperty] private string _titleEn = "";
    [ObservableProperty] private string _icon = "";
    [ObservableProperty] private string _bgColor = "";
    [ObservableProperty] private string _textColor = "";
    [ObservableProperty] private bool _isActive;
}

public partial class ReviewDisplayModel : ObservableObject
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _authorName = "";
    [ObservableProperty] private string _authorInitials = "";
    [ObservableProperty] private double _rating;
    [ObservableProperty] private string _comment = "";
    [ObservableProperty] private string _dateText = "";
    [ObservableProperty] private bool _isMine;
}

public partial class PublishedTripDisplayModel : ObservableObject
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _departure = "";
    [ObservableProperty] private string _arrival = "";
    [ObservableProperty] private string _date = "";
    [ObservableProperty] private string _time = "";
    [ObservableProperty] private int _seatsLeft;
    [ObservableProperty] private decimal _price;
}

public partial class UsualTripDisplayModel : ObservableObject
{
    [ObservableProperty] private string _departure = "";
    [ObservableProperty] private string _arrival = "";
}

public partial class VehicleDisplayModel : ObservableObject
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _make = "";
    [ObservableProperty] private string _model = "";
    [ObservableProperty] private int _year;
    [ObservableProperty] private string _color = "";
    [ObservableProperty] private string _licensePlate = "";
    [ObservableProperty] private int _maxSeats;
    [ObservableProperty] private int _passengerSeats;
    [ObservableProperty] private string? _photoUrl;
    [ObservableProperty] private bool _isActive;
    [ObservableProperty] private bool _isValidated;
    [ObservableProperty] private bool _adminRequestDocuments;
    [ObservableProperty] private string _statusLabel = "";
}

public partial class DocumentDisplayModel : ObservableObject
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private string _labelFr = "";
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private DateTime? _expiresAt;
    [ObservableProperty] private bool _requiresUpload;
}

public partial class StatCardDisplayModel : ObservableObject
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _value = "";
    [ObservableProperty] private string _icon = "";
    [ObservableProperty] private string _color = "";
    [ObservableProperty] private string _subtitle = "";
}

public partial class NotificationPrefsDisplayModel : ObservableObject
{
    [ObservableProperty] private bool _emailPrimordiales;
    [ObservableProperty] private bool _emailSecondaires;
    [ObservableProperty] private bool _emailNegligeables;
    [ObservableProperty] private bool _pushPrimordiales;
    [ObservableProperty] private bool _pushSecondaires;
    [ObservableProperty] private bool _pushNegligeables;
}

public partial class PrivacyDisplayModel : ObservableObject
{
    [ObservableProperty] private bool _showPhoneNumber;
    [ObservableProperty] private bool _showLastName;
    [ObservableProperty] private bool _allowAffinityTracking;
}

public partial class VisibilityDisplayModel : ObservableObject
{
    [ObservableProperty] private bool _goScore;
    [ObservableProperty] private bool _tripsCount;
    [ObservableProperty] private bool _globalRating;
    [ObservableProperty] private bool _co2Saved;
}

public partial class TripAmbianceDisplayModel : ObservableObject
{
    [ObservableProperty] private bool _musicAccepted;
    [ObservableProperty] private bool _petsAccepted;
    [ObservableProperty] private bool _smokingAccepted;
    [ObservableProperty] private ConversationLevel _conversationLevel;
}

public partial class AccessibilityDisplayModel : ObservableObject
{
    [ObservableProperty] private string _fontSize = "medium";
    [ObservableProperty] private bool _highContrast;
    [ObservableProperty] private bool _reducedMotion;
    [ObservableProperty] private bool _screenReaderOptimized;
}

public partial class SearchPrefsDisplayModel : ObservableObject
{
    [ObservableProperty] private int _defaultDepartureRadiusMeters = 500;
    [ObservableProperty] private int _defaultArrivalRadiusMeters = 500;
    [ObservableProperty] private int _defaultTimeToleranceMinutes = 15;
    [ObservableProperty] private double? _defaultMaxPrice;
    [ObservableProperty] private bool _requireVerifiedDriver;
    [ObservableProperty] private int _minDriverGoScore;
    [ObservableProperty] private double _minDriverRating;
    [ObservableProperty] private int _minPassengerGoScore;
    [ObservableProperty] private bool _requirePassengerMessage;
}

public partial class MeDisplayModel : ObservableObject
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _email = "";
    [ObservableProperty] private string _notificationEmail = "";
    [ObservableProperty] private string _firstName = "";
    [ObservableProperty] private string _lastName = "";
    [ObservableProperty] private string? _phone;
    [ObservableProperty] private string? _avatarUrl;
    [ObservableProperty] private string? _bio;
    [ObservableProperty] private string _role = "";
    [ObservableProperty] private SchoolRole _schoolRole;
    [ObservableProperty] private ObservableCollection<string> _languagesSpoken = new();
}

public partial class DriverProfileDisplayModel : ObservableObject
{
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private double _rating;
    [ObservableProperty] private int _tripsCount;
    [ObservableProperty] private int _totalKm;
    [ObservableProperty] private int _seatsAvailable;
    [ObservableProperty] private string _vehicleSummary = "";
    [ObservableProperty] private bool _isValidated;
}

public partial class UserPublicDisplayModel : ObservableObject
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _firstName = "";
    [ObservableProperty] private string _lastName = "";
    [ObservableProperty] private string? _bio;
    [ObservableProperty] private string _photoInitials = "";
    [ObservableProperty] private ObservableCollection<string> _languagesSpoken = new();
    [ObservableProperty] private string _schoolRole = "";
    [ObservableProperty] private string _driverRole = "";
    [ObservableProperty] private string _joinDate = "";
    [ObservableProperty] private double _goScore;
    [ObservableProperty] private DriverProfileDisplayModel? _driverProfile;
}

public partial class ProfileSettingsPageDisplayModel : ObservableObject
{
    [ObservableProperty] private MeDisplayModel _me = new();
    [ObservableProperty] private NotificationPrefsDisplayModel _notifications = new();
    [ObservableProperty] private PrivacyDisplayModel _privacy = new();
    [ObservableProperty] private VisibilityDisplayModel _visibility = new();
    [ObservableProperty] private TripAmbianceDisplayModel _tripAmbiance = new();
    [ObservableProperty] private AccessibilityDisplayModel _accessibility = new();
    [ObservableProperty] private SearchPrefsDisplayModel _searchPrefs = new();
    [ObservableProperty] private ObservableCollection<VehicleDisplayModel> _vehicles = new();
    [ObservableProperty] private VehicleDisplayModel? _activeVehicle;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _hasUnsavedChanges;
    [ObservableProperty] private bool _isSaving;
}

public partial class PublicProfilePageDisplayModel : ObservableObject
{
    [ObservableProperty] private UserPublicDisplayModel _userPublic = new();
    [ObservableProperty] private ObservableCollection<ReviewDisplayModel> _reviews = new();
    [ObservableProperty] private ObservableCollection<PublishedTripDisplayModel> _publishedTrips = new();
    [ObservableProperty] private ObservableCollection<UsualTripDisplayModel> _recurringTrips = new();
    [ObservableProperty] private ObservableCollection<BadgeDisplayModel> _badges = new();
    [ObservableProperty] private ObservableCollection<StatCardDisplayModel> _stats = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isFavorite;
}
