// ============================================================
//  Features/notifications/DisplayModels/NotificationDisplayModels.cs
//  DisplayModels de la feature Notifications
//  Utilisés par NotificationDetailPanel (composant) et
//  nourris par NotificationsDisplayConverter.
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels
{
    // ── Données d'un payload trajet ──────────────────────────
    public record NotifTripDetailRow(
        string IconKey,     // "location" | "arrow" | "calendar" | "clock" | "dollar" | "seat"
        string Label,
        string Value
    );

    // ── Données d'un avis ────────────────────────────────────
    public record NotifReviewData(
        double Rating,
        string Comment,
        string ReviewerName
    );

    // ── Données alerte sécurité ──────────────────────────────
    public record NotifSecurityData(
        string ClientTypeLabel, // "Navigateur web" | "Application mobile"
        string? Location
    );

    // ── Parties concernées (réservation) ────────────────────
    public record NotifPersonData(
        string Label,   // "Passager" | "Conducteur"
        string Name,
        double? Rating
    );

    // ── DisplayModel carte (liste) ───────────────────────────────
    public class NotificationCardDisplayModel
    {
        public string  Id           { get; init; } = "";
        public string  TypeLabel    { get; init; } = "";
        public string  TypeIconKey  { get; init; } = "";
        public string  Title        { get; init; } = "";
        public string  DateStr      { get; init; } = "";
        public string  Snippet      { get; init; } = "";   // 1 ligne du message
        public bool    IsRead       { get; init; }
        public bool    IsUrgent     { get; init; }
        /// <summary>true → notif de rôle conducteur, false → passager/les deux.</summary>
        public bool    IsDriverRole { get; init; }

        // Couleurs dérivées (lecture seule)
        public string DotColor    => IsUrgent ? "#dc2626" : (IsRead ? "#d1d5db" : "#08316e");
        public string IconBgColor => IsUrgent ? "#fef2f2" : "#e8eef7";
        public string TitleColor  => IsRead   ? "#6b7280" : "#0D1624";
    }

    // ── DisplayModel principal (panneau détail) ───────────────
    public class NotificationDetailDisplayModel : INotifyPropertyChanged
    {
        private string _id = "";
        private string _typeLabel = "";
        private string _typeIconKey = "";
        private bool _isUrgent;
        private string _title = "";
        private string _dateStr = "";
        private string _timeStr = "";
        private bool _isRead;
        private string _message = "";
        private string? _actionLabel;
        private string? _actionLink;
        private bool _hasTripDetails;
        private bool _hasReservationDetails;
        private bool _hasReviewDetails;
        private bool _hasSecurityDetails;

        private IReadOnlyList<NotifTripDetailRow> _tripRows = Array.Empty<NotifTripDetailRow>();
        private IReadOnlyList<NotifPersonData> _persons = Array.Empty<NotifPersonData>();
        private NotifReviewData? _review;
        private NotifSecurityData? _security;

        public string Id { get => _id; set => SetField(ref _id, value); }
        public string TypeLabel { get => _typeLabel; set => SetField(ref _typeLabel, value); }
        public string TypeIconKey { get => _typeIconKey; set => SetField(ref _typeIconKey, value); }
        public bool IsUrgent { get => _isUrgent; set => SetField(ref _isUrgent, value); }
        public string Title { get => _title; set => SetField(ref _title, value); }
        public string DateStr { get => _dateStr; set => SetField(ref _dateStr, value); }
        public string TimeStr { get => _timeStr; set => SetField(ref _timeStr, value); }
        public bool IsRead { get => _isRead; set => SetField(ref _isRead, value); }
        public string Message { get => _message; set => SetField(ref _message, value); }
        public string? ActionLabel { get => _actionLabel; set => SetField(ref _actionLabel, value); }
        public string? ActionLink { get => _actionLink; set => SetField(ref _actionLink, value); }
        public bool HasActionButton => ActionLink is not null;

        public bool HasTripDetails { get => _hasTripDetails; set => SetField(ref _hasTripDetails, value); }
        public bool HasReservationDetails { get => _hasReservationDetails; set => SetField(ref _hasReservationDetails, value); }
        public bool HasReviewDetails { get => _hasReviewDetails; set => SetField(ref _hasReviewDetails, value); }
        public bool HasSecurityDetails { get => _hasSecurityDetails; set => SetField(ref _hasSecurityDetails, value); }

        public IReadOnlyList<NotifTripDetailRow> TripRows { get => _tripRows; set => SetField(ref _tripRows, value); }
        public IReadOnlyList<NotifPersonData> Persons { get => _persons; set => SetField(ref _persons, value); }
        public NotifReviewData? Review { get => _review; set => SetField(ref _review, value); }
        public NotifSecurityData? Security { get => _security; set => SetField(ref _security, value); }

        // Couleurs dérivées (utilisées directement depuis le XAML)
        public string HeaderColor => IsUrgent ? "#dc2626" : "#08316e";
        public string IconBgColor => IsUrgent ? "#fef2f2" : "#e8eef7";
        public string ReadStatusLabel => IsRead ? "Lu" : "Non lu";
        public string ReadStatusColor => IsRead ? "#6b7280" : "#08316e";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(name);
            // Cascader les dérivées si IsRead change
            if (name == nameof(IsRead))
            {
                OnPropertyChanged(nameof(ReadStatusLabel));
                OnPropertyChanged(nameof(ReadStatusColor));
            }
            return true;
        }
    }
}
