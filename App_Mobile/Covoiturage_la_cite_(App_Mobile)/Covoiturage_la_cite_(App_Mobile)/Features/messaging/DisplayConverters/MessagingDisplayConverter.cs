// ============================================================
//  Features/messaging/DisplayConverters/MessagingDisplayConverter.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayConverters
{
    public static class MessagingDisplayConverter
    {
        public static ConversationCardDisplayModel ToCard(ConversationModel c)
        {
            var lastAt = DateTime.TryParse(c.LastMessageAt, out var dt) ? dt : DateTime.Now;
            var atStr  = FormatRelativeTime(lastAt);

            var tripDate = DateTime.TryParse(c.TripDate, out var td)
                ? td.ToString("d MMM", new System.Globalization.CultureInfo("fr-CA"))
                : c.TripDate;

            var snippet = c.LastMessageText.Length > 60
                ? c.LastMessageText[..57] + "…"
                : c.LastMessageText;

            return new ConversationCardDisplayModel
            {
                Id               = c.Id,
                TripId           = c.TripId,
                OtherPersonName  = c.OtherPersonName,
                OtherPersonRole  = c.OtherPersonRole,
                TripRoute        = c.TripRoute,
                TripDateStr      = tripDate,
                LastMessageSnippet = snippet,
                LastMessageAtStr = atStr,
                UnreadCount      = c.UnreadCount,
                SelfIsDriver     = c.SelfIsDriver,
            };
        }

        public static ConversationDetailDisplayModel ToDetail(ConversationModel c)
        {
            var tripDate = DateTime.TryParse(c.TripDate, out var td)
                ? td.ToString("d MMMM yyyy", new System.Globalization.CultureInfo("fr-CA"))
                : c.TripDate;

            var bubbles = c.Messages.Select(m =>
            {
                var at = DateTime.TryParse(m.SentAt, out var dt)
                    ? dt.ToString("HH:mm")
                    : m.SentAt;
                return new MessageBubbleDisplayModel
                {
                    Id         = m.Id,
                    Content    = m.Content,
                    TimeStr    = at,
                    IsSelf     = m.SenderRole == MessageSenderRole.Self,
                    SenderName = m.SenderName,
                };
            }).ToList();

            return new ConversationDetailDisplayModel
            {
                TripRoute       = c.TripRoute,
                TripDateStr     = $"{tripDate} à {c.TripTime}",
                OtherPersonName = c.OtherPersonName,
                OtherPersonRole = c.OtherPersonRole,
                Messages        = bubbles,
                IsLoading       = false,
            };
        }

        private static string FormatRelativeTime(DateTime dt)
        {
            var now  = DateTime.Now;
            var diff = now - dt;
            if (diff.TotalMinutes < 1)   return "à l'instant";
            if (diff.TotalHours   < 1)   return $"{(int)diff.TotalMinutes} min";
            if (diff.TotalDays    < 1)   return dt.ToString("HH:mm");
            if (diff.TotalDays    < 7)   return dt.ToString("ddd", new System.Globalization.CultureInfo("fr-CA"));
            return dt.ToString("d MMM",  new System.Globalization.CultureInfo("fr-CA"));
        }
    }
}
