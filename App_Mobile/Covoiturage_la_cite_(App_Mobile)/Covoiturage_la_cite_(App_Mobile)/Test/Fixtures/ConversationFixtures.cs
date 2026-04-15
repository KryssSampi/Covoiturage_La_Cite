// ============================================================
//  Test/Fixtures/ConversationFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class ConversationFixtures
    {
        public static readonly IReadOnlyList<ConversationModel> All = new List<ConversationModel>
        {
            // Conversation passager (moi passager, l'autre est conducteur)
            new()
            {
                Id              = "conv-001",
                TripId          = "trip-001",
                TripRoute       = "Campus La Cité → Place d'Orléans",
                TripDate        = "2026-04-02",
                TripTime        = "08:00",
                OtherPersonName = "Jean Dupont",
                OtherPersonRole = "Conducteur",
                LastMessageText = "À demain alors, soyez à l'heure !",
                LastMessageAt   = "2026-04-01T20:15:00",
                UnreadCount     = 1,
                SelfIsDriver    = false,
                Messages        = new List<MessageModel>
                {
                    new() { Id = "msg-001", ConversationId = "conv-001", Content = "Bonjour, est-ce que je peux me joindre à votre trajet ?", SentAt = "2026-04-01T18:30:00", SenderRole = MessageSenderRole.Self,  SenderName = "Moi",        IsRead = true  },
                    new() { Id = "msg-002", ConversationId = "conv-001", Content = "Bien sûr ! Point de rendez-vous : parking Campus La Cité côté est.",           SentAt = "2026-04-01T18:45:00", SenderRole = MessageSenderRole.Other, SenderName = "Jean Dupont", IsRead = true  },
                    new() { Id = "msg-003", ConversationId = "conv-001", Content = "Parfait, merci ! Est-ce qu'on peut partir 5 min plus tôt si possible ?",        SentAt = "2026-04-01T19:00:00", SenderRole = MessageSenderRole.Self,  SenderName = "Moi",        IsRead = true  },
                    new() { Id = "msg-004", ConversationId = "conv-001", Content = "À demain alors, soyez à l'heure !",                                              SentAt = "2026-04-01T20:15:00", SenderRole = MessageSenderRole.Other, SenderName = "Jean Dupont", IsRead = false },
                },
            },
            // Conversation conducteur (moi conducteur, l'autre est passager)
            new()
            {
                Id              = "conv-002",
                TripId          = "trip-002",
                TripRoute       = "Campus La Cité → Carrefour de l'Outaouais",
                TripDate        = "2026-04-05",
                TripTime        = "17:30",
                OtherPersonName = "Marie Tremblay",
                OtherPersonRole = "Passager",
                LastMessageText = "Super, merci beaucoup !",
                LastMessageAt   = "2026-04-03T14:22:00",
                UnreadCount     = 0,
                SelfIsDriver    = true,
                Messages        = new List<MessageModel>
                {
                    new() { Id = "msg-005", ConversationId = "conv-002", Content = "Bonjour ! J'ai une valise, est-ce que ça pose un problème ?",        SentAt = "2026-04-03T14:00:00", SenderRole = MessageSenderRole.Other, SenderName = "Marie Tremblay", IsRead = true },
                    new() { Id = "msg-006", ConversationId = "conv-002", Content = "Pas de souci, le coffre est grand. À vendredi !",                    SentAt = "2026-04-03T14:20:00", SenderRole = MessageSenderRole.Self,  SenderName = "Moi",            IsRead = true },
                    new() { Id = "msg-007", ConversationId = "conv-002", Content = "Super, merci beaucoup !",                                             SentAt = "2026-04-03T14:22:00", SenderRole = MessageSenderRole.Other, SenderName = "Marie Tremblay", IsRead = true },
                },
            },
            // Conversation passager sans réponse
            new()
            {
                Id              = "conv-003",
                TripId          = "trip-003",
                TripRoute       = "Gatineau Centre → Campus La Cité",
                TripDate        = "2026-03-20",
                TripTime        = "08:30",
                OtherPersonName = "Marc Leblanc",
                OtherPersonRole = "Conducteur",
                LastMessageText = "Avez-vous de l'espace pour un sac à dos ?",
                LastMessageAt   = "2026-03-19T21:00:00",
                UnreadCount     = 0,
                SelfIsDriver    = false,
                Messages        = new List<MessageModel>
                {
                    new() { Id = "msg-008", ConversationId = "conv-003", Content = "Avez-vous de l'espace pour un sac à dos ?", SentAt = "2026-03-19T21:00:00", SenderRole = MessageSenderRole.Self, SenderName = "Moi", IsRead = true },
                },
            },
        };

        public static ConversationModel? FindById(string id) =>
            All.FirstOrDefault(c => c.Id == id);

        public static ConversationModel? FindByTripId(string tripId) =>
            All.FirstOrDefault(c => c.TripId == tripId);
    }
}
