// ============================================================
//  App/Mobilepages/notificationdetailpage/DisplayControler/
//  NotificationDetailPageDisplayController.cs
//
//  Orchestre la page NotificationDetailPage :
//   - Reçoit le notificationId via Shell QueryProperty
//   - Charge le NotificationModel (ici depuis fixtures — TODO : API)
//   - Nourrit NotificationsDisplayController (feature)
//   - Expose le DisplayModel de page
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.DisplayControler
{
    [QueryProperty(nameof(NotificationId), "notificationId")]
    public class NotificationDetailPageDisplayController : INotifyPropertyChanged
    {
        private readonly NotificationsDisplayController _featureController;
        private readonly NotificationDetailPageDisplayModel _pageModel;

        private string? _notificationId;

        public NotificationDetailPageDisplayModel PageModel => _pageModel;

        public ICommand GoBackCommand => _featureController.GoBackCommand;

        public NotificationDetailPageDisplayController(
            NotificationsDisplayController featureController)
        {
            _featureController = featureController;
            _pageModel = new NotificationDetailPageDisplayModel();

            // Lorsque la feature met à jour son Detail, on le pousse dans le PageModel
            _featureController.PropertyChanged += (_, e) =>
            {
                if (e.PropertyName == nameof(NotificationsDisplayController.Detail))
                    _pageModel.NotificationDetail = _featureController.Detail;
            };
        }

        /// <summary>
        /// Reçu via navigation Shell : //notificationdetail?notificationId=xxx
        /// </summary>
        public string? NotificationId
        {
            get => _notificationId;
            set
            {
                _notificationId = Uri.UnescapeDataString(value ?? "");
                _ = LoadAsync(_notificationId);
            }
        }

        private async Task LoadAsync(string id)
        {
            _pageModel.IsLoading = true;
            try
            {
                // ── TODO : remplacer par appel API : GET /api/notifications/{id} ──
                var notification = await Task.Run(() =>
                    NotificationFixtures.All.FirstOrDefault(n => n.Id == id)
                    ?? NotificationFixtures.All.FirstOrDefault());

                if (notification is null) return;

                _featureController.Load(notification);
                _pageModel.PageTitle = notification.Title;

                // Marquer comme lu après affichage
                _featureController.OnMarkRead = async nId =>
                {
                    // TODO : PATCH /api/notifications/{nId}/read
                    await Task.CompletedTask;
                };
                if (!notification.IsRead && _featureController.MarkReadCommand.CanExecute(id))
                    _featureController.MarkReadCommand.Execute(id);
            }
            finally
            {
                _pageModel.IsLoading = false;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
