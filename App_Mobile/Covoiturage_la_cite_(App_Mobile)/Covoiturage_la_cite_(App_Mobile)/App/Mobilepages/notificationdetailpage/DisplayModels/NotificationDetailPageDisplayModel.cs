// ============================================================
//  App/Mobilepages/notificationdetailpage/DisplayModels/
//  NotificationDetailPageDisplayModel.cs
//
//  Agrégateur de page — composition du DisplayModel de feature.
//  Le BindingContext de NotificationDetailPage est positionné ici.
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.notificationdetailpage.DisplayModels
{
    public class NotificationDetailPageDisplayModel : INotifyPropertyChanged
    {
        private bool _isLoading = true;
        private string _pageTitle = "Notification";
        private NotificationDetailDisplayModel? _notificationDetail;

        /// <summary>Affiché dans la TopBar pendant le chargement.</summary>
        public bool IsLoading
        {
            get => _isLoading;
            set => SetField(ref _isLoading, value);
        }

        public string PageTitle
        {
            get => _pageTitle;
            set => SetField(ref _pageTitle, value);
        }

        /// <summary>
        /// DisplayModel de la feature notifications.
        /// Alimenté par NotificationDetailPageDisplayController après chargement.
        /// </summary>
        public NotificationDetailDisplayModel? NotificationDetail
        {
            get => _notificationDetail;
            set => SetField(ref _notificationDetail, value);
        }

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
