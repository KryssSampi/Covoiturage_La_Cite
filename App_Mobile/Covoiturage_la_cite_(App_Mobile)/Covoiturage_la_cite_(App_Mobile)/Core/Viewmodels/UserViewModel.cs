using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Services.Api;

namespace Covoiturage_la_cite__App_Mobile_.Core.Viewmodels
{
    public class UserViewModel : INotifyPropertyChanged
    {
        private IApiService? _api;

        /// <summary>Injecte l'ApiService après construction (évite la dépendance circulaire DI).</summary>
        public void SetApiService(IApiService api) => _api = api;

        private string _firstName = "";
        private string _lastName = "";
        private string _initials = "";
        private string _email = "";
        private string _avatarUrl = "";
        private UserModel _user = new(
            "", // Id
            "", // Email
            "", // FirstName
            "", // LastName
            "", // Initials
            null, // AvatarUrl
            null, // Phone
            UserRole.Passenger, // Role
            false, // CanBeDriver
            false, // ProfileVerified
            false, // IsActive
            null, // DriverProfile
            null, // PassengerProfile
            new UserPreferences(false, false, false, ConversationLevel.Moderate), // Preferences
            0, // GoScore
            new List<string>(), // BadgeIds
            null, // PreferencesId
            null, // CurrentLocation
            default, // CreatedAt
            default // UpdatedAt
        );
private UserRole? _role;
public UserRole Role
{
    get => _role ?? UserRole.Driver;
    set
    {
        if (_role != value)
        {
            _role = value;
            OnPropertyChanged();
        }
    }
}

        public string FirstName { get => _firstName; set => SetField(ref _firstName, value); }
        public string LastName { get => _lastName; set => SetField(ref _lastName, value); }
        public string Initials { get => _initials; set => SetField(ref _initials, value); }
        public string Email { get => _email; set => SetField(ref _email, value); }
        public string AvatarUrl { get => _avatarUrl; set => SetField(ref _avatarUrl, value); }

        public UserModel User
        {
            get => _user;
            set
            {
                if (SetField(ref _user, value))
                    Load(value);
            }
        }

        public string DisplayName => string.IsNullOrWhiteSpace(LastName)
            ? FirstName
            : $"{FirstName} {LastName}";

        /// <summary>
        /// Charge le profil depuis le Server Core et peuple le ViewModel.
        /// Appelé juste après un login réussi.
        /// </summary>
        public async Task LoadFromServerAsync(string userId)
        {
            if (_api == null) return;
            try
            {
                var dto = await _api.GetAsync<UserDto>("api/users/me");
                if (dto == null) return;

                FirstName = dto.FirstName ?? "";
                LastName = dto.LastName ?? "";
                Initials = dto.Initials ?? $"{dto.FirstName?[0]}{dto.LastName?[0]}".ToUpper();
                Email = dto.Email ?? "";
                AvatarUrl = dto.AvatarUrl ?? "";
                Role = dto.Role == "Driver" ? UserRole.Driver : UserRole.Passenger;
                OnPropertyChanged(nameof(DisplayName));
            }
            catch { /* Si offline, le VM reste avec le state précédent */ }
        }

        public void Load(UserModel model)
        {
            FirstName = model.FirstName;
            LastName = model.LastName;
            Initials = model.Initials;
            Email = model.Email;
            AvatarUrl = model.AvatarUrl ?? "";
            _role = model.Role;
            OnPropertyChanged(nameof(DisplayName));
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(name);
            if (name is nameof(FirstName) or nameof(LastName))
                OnPropertyChanged(nameof(DisplayName));
            return true;
        }
    }
}
