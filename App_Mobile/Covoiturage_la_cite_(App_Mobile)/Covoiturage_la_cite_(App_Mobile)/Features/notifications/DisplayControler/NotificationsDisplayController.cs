// ============================================================
//  Features/notifications/DisplayControler/NotificationsDisplayController.cs
//  Orchestre le DisplayModel de la feature notifications.
//  Alimenté par NotificationDetailPageDisplayController (page).
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;

namespace Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayControler
{
    public class NotificationsDisplayController : INotifyPropertyChanged
    {
        private readonly NavigationService _nav;
        private NotificationDetailDisplayModel? _detail;

        public NotificationDetailDisplayModel? Detail
        {
            get => _detail;
            private set => SetField(ref _detail, value);
        }

        public ICommand FollowLinkCommand { get; }
        public ICommand GoBackCommand { get; }
        public ICommand MarkReadCommand { get; }

        /// <summary>
        /// Action injectée par la page pour marquer une notification comme lue via API.
        /// </summary>
        public Func<string, Task>? OnMarkRead { get; set; }

        public NotificationsDisplayController(NavigationService nav)
        {
            _nav = nav;

            GoBackCommand = new Command(async () =>
                await Shell.Current.GoToAsync(".."));

            FollowLinkCommand = new Command(() =>
            {
                // TODO : brancher sur la navigation mobile quand les routes seront mappées
            });

            MarkReadCommand = new Command<string>(async id =>
            {
                if (OnMarkRead is not null && !string.IsNullOrWhiteSpace(id))
                    await OnMarkRead(id);
            });
        }

        /// <summary>
        /// Alimente le DisplayModel à partir d'un NotificationModel.
        /// Appelé par la page après récupération des données.
        /// </summary>
        public void Load(NotificationModel notification)
        {
            Detail = NotificationsDisplayConverter.ToDetailDisplayModel(notification);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
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
