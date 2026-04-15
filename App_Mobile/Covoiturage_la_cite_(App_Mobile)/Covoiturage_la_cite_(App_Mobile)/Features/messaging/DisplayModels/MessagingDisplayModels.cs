// ============================================================
//  Features/messaging/DisplayModels/MessagingDisplayModels.cs
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels
{
    // ── Carte de liste (une conversation) ────────────────────────────────────

    public class ConversationCardDisplayModel
    {
        public string Id              { get; init; } = "";
        public string TripId          { get; init; } = "";
        public string OtherPersonName { get; init; } = "";
        public string OtherPersonRole { get; init; } = "";   // "Conducteur" | "Passager"
        public string TripRoute       { get; init; } = "";
        public string TripDateStr     { get; init; } = "";
        public string LastMessageSnippet { get; init; } = "";
        public string LastMessageAtStr   { get; init; } = "";
        public int    UnreadCount        { get; init; }
        /// <summary>true = cette conversation concerne un trajet où je suis conducteur.</summary>
        public bool   SelfIsDriver    { get; init; }

        // Dérivés
        public bool   HasUnread       => UnreadCount > 0;
        public string UnreadLabel     => UnreadCount > 9 ? "9+" : UnreadCount.ToString();
        public string AvatarInitial   => OtherPersonName.Length > 0 ? OtherPersonName[0].ToString() : "?";
    }

    // ── Bulle de message ─────────────────────────────────────────────────────

    public class MessageBubbleDisplayModel
    {
        public string Id          { get; init; } = "";
        public string Content     { get; init; } = "";
        public string TimeStr     { get; init; } = "";
        public bool   IsSelf      { get; init; }
        public string SenderName  { get; init; } = "";

        // Couleurs dérivées
        public string BubbleBgHex  => IsSelf ? "#08316e" : "#EEF0F5";
        public string TextColorHex => IsSelf ? "#FFFFFF" : "#0D1624";
        public string TimeColorHex => IsSelf ? "#93c5fd" : "#9ca3af";
    }

    // ── Page de conversation (détail) ────────────────────────────────────────

    public class ConversationDetailDisplayModel : INotifyPropertyChanged
    {
        private bool   _isLoading = true;
        private string _draftText = "";
        private IReadOnlyList<MessageBubbleDisplayModel> _messages = Array.Empty<MessageBubbleDisplayModel>();

        public string TripRoute       { get; set; } = "";
        public string TripDateStr     { get; set; } = "";
        public string OtherPersonName { get; set; } = "";
        public string OtherPersonRole { get; set; } = "";

        public bool   IsLoading { get => _isLoading; set => Set(ref _isLoading, value); }

        public IReadOnlyList<MessageBubbleDisplayModel> Messages
        {
            get => _messages;
            set => Set(ref _messages, value);
        }

        public string DraftText
        {
            get => _draftText;
            set { Set(ref _draftText, value); OnPropertyChanged(nameof(CanSend)); }
        }

        public bool CanSend => !string.IsNullOrWhiteSpace(DraftText);

        public string PageTitle => OtherPersonName;

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? n = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));
        private bool Set<T>(ref T f, T v, [CallerMemberName] string? n = null)
        {
            if (EqualityComparer<T>.Default.Equals(f, v)) return false;
            f = v; OnPropertyChanged(n); return true;
        }
    }
}
