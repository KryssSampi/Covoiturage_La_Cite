using System.ComponentModel;
using System.Runtime.CompilerServices;
using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Core.Viewmodels
{
    public class UserViewModel : INotifyPropertyChanged
    {
        private string _firstName = "";
        private string _lastName = "";
        private string _initials = "";
        private string _email = "";
        private string _avatarUrl = "";
        private UserRole _role = UserRole.Passenger;

        public string FirstName { get => _firstName; set => SetField(ref _firstName, value); }
        public string LastName { get => _lastName; set => SetField(ref _lastName, value); }
        public string Initials { get => _initials; set => SetField(ref _initials, value); }
        public string Email { get => _email; set => SetField(ref _email, value); }
        public string AvatarUrl { get => _avatarUrl; set => SetField(ref _avatarUrl, value); }
        public UserRole Role { get => _role; set => SetField(ref _role, value); }

        public string DisplayName => string.IsNullOrWhiteSpace(LastName)
            ? FirstName
            : $"{FirstName} {LastName}";

        public void Load(UserModel model)
        {
            FirstName = model.FirstName;
            LastName = model.LastName;
            Initials = model.Initials;
            Email = model.Email;
            AvatarUrl = model.AvatarUrl ?? "";
            Role = model.Role;
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
