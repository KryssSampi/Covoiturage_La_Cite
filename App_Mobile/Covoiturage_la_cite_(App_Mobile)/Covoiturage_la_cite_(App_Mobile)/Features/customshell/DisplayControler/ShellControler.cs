using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;

namespace Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler
{/// <summary>
 /// ViewModel partagé par le Shell et ses composants (Header, NavBar).
 /// Injectez-le en Singleton dans MauiProgram.cs.
 /// </summary>
    public class ShellControler : INotifyPropertyChanged
    {
        // ─────────────────────────────────────────────
        //  Titre de la Navbar (centré)
        // ─────────────────────────────────────────────
        private string _pageTitle = "La Cité Covoiturage";
        public string PageTitle
        {
            get => _pageTitle;
            set => SetField(ref _pageTitle, value);
        }

        // ─────────────────────────────────────────────
        //  Badge de notification
        // ─────────────────────────────────────────────
        private int _notificationCount = 3; // 0 = pas de pastille
        public int NotificationCount
        {
            get => _notificationCount;
            set
            {
                SetField(ref _notificationCount, value);
                OnPropertyChanged(nameof(HasNotifications));
                OnPropertyChanged(nameof(NotificationBadgeText));
            }
        }

        /// <summary>True si le badge doit être affiché (count > 0)</summary>
        public bool HasNotifications => _notificationCount > 0;

        /// <summary>Texte du badge (99+ si dépassement)</summary>
        public string NotificationBadgeText =>
            _notificationCount > 99 ? "99+" : _notificationCount.ToString();

        // ─────────────────────────────────────────────
        //  Profil utilisateur (pour le Header du SideNav)
        // ─────────────────────────────────────────────
        private string _userName = "Sophie Pelletier";
        public string UserName
        {
            get => _userName;
            set => SetField(ref _userName, value);
        }

        private string _userEmail = "sophie.pelletier@collegelacite.ca";
        public string UserEmail
        {
            get => _userEmail;
            set => SetField(ref _userEmail, value);
        }

        private string _userAvatarUrl = "";
        public string UserAvatarUrl
        {
            get => _userAvatarUrl;
            set
            {
                SetField(ref _userAvatarUrl, value);
                OnPropertyChanged(nameof(HasAvatar));
                OnPropertyChanged(nameof(UserInitials));
            }
        }

        public bool HasAvatar => !string.IsNullOrWhiteSpace(_userAvatarUrl);

        public string UserInitials
        {
            get
            {
                var parts = _userName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                return parts.Length >= 2
                    ? $"{parts[0][0]}{parts[1][0]}".ToUpper()
                    : _userName.Length > 0 ? _userName[0].ToString().ToUpper() : "?";
            }
        }

        // ─────────────────────────────────────────────
        //  Loading global (pour navigation Shell)
        // ─────────────────────────────────────────────
        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set => SetField(ref _isLoading, value);
        }

        private string _loadingMessage = "Chargement...";
        public string LoadingMessage
        {
            get => _loadingMessage;
            set => SetField(ref _loadingMessage, value);
        }

        public void ShowLoading(string? message = null)
        {
            LoadingMessage = message ?? "Chargement...";
            IsLoading = true;
        }

        public void HideLoading()
        {
            IsLoading = false;
        }

        // ─────────────────────────────────────────────
        //  Commandes
        // ─────────────────────────────────────────────
        public ICommand OpenNotificationsCommand { get; }
        public ICommand OpenMenuCommand { get; }
        public ICommand LogoutCommand { get; }

        private readonly NavigationService _navService;

        public ShellControler(NavigationService navService)
        {
            _navService = navService;
            OpenNotificationsCommand = new Command(() =>
                _navService.GoTo("notifications"));

            OpenMenuCommand = new Command(() =>
                Shell.Current.FlyoutIsPresented = true);

            LogoutCommand = new Command(async () =>
            {
                bool confirmed = await Shell.Current.DisplayAlert(
                    "Déconnexion",
                    "Voulez-vous vraiment vous déconnecter ?",
                    "Oui, déconnecter",
                    "Annuler");

                if (confirmed)
                {
                    // TODO: brancher AuthService.Logout()
                    await Shell.Current.GoToAsync("//login");
                }
            });
        }

        // ─────────────────────────────────────────────
        //  Méthode appelée par AppShell.OnNavigated
        // ─────────────────────────────────────────────
        public void UpdateTitle(string title) => PageTitle = title;

        // ─────────────────────────────────────────────
        //  INotifyPropertyChanged boilerplate
        // ─────────────────────────────────────────────
        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(name);
            return true;
        }
    }

}
