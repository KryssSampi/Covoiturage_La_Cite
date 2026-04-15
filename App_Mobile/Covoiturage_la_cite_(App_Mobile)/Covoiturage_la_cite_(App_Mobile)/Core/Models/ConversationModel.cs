// ============================================================
//  Core/Models/ConversationModel.cs
//  Modèles de messagerie trajet (entre conducteur et passager)
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    /// <summary>Qui a envoyé ce message du point de vue de l'utilisateur courant.</summary>
    public enum MessageSenderRole { Self, Other }

    /// <summary>Un message dans une conversation de trajet.</summary>
    public class MessageModel
    {
        public string            Id             { get; init; } = "";
        public string            ConversationId { get; init; } = "";
        public string            Content        { get; init; } = "";
        public string            SentAt         { get; init; } = "";   // ISO 8601
        public MessageSenderRole SenderRole     { get; init; }
        public string            SenderName     { get; init; } = "";
        public bool              IsRead         { get; init; }
    }

    /// <summary>
    /// Conversation entre un conducteur et un passager, liée à un trajet.
    /// </summary>
    public class ConversationModel
    {
        public string Id              { get; init; } = "";
        public string TripId          { get; init; } = "";
        public string TripRoute       { get; init; } = "";   // "Campus La Cité → Place d'Orléans"
        public string TripDate        { get; init; } = "";   // "2026-04-02"
        public string TripTime        { get; init; } = "";   // "08:00"

        /// <summary>Nom de l'autre personne (conducteur ou passager selon le rôle).</summary>
        public string OtherPersonName   { get; init; } = "";
        public string? OtherPersonAvatar { get; init; }
        /// <summary>"Conducteur" | "Passager" — rôle de l'autre personne dans ce trajet.</summary>
        public string OtherPersonRole   { get; init; } = "";

        public string LastMessageText  { get; init; } = "";
        public string LastMessageAt    { get; init; } = "";   // ISO 8601
        public int    UnreadCount      { get; init; }

        /// <summary>true = vous êtes conducteur dans ce trajet.</summary>
        public bool SelfIsDriver { get; init; }

        public IReadOnlyList<MessageModel> Messages { get; init; } = Array.Empty<MessageModel>();
    }
}
