// ============================================================
//  Features/messaging/DisplayControler/MessagingListDisplayController.cs
//  Contrôleur de liste des conversations.
//  Wraps ItemListController<ConversationCardDisplayModel>.
//  2 onglets (Passager / Conducteur) si canBeDriver.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayControler
{
    public class MessagingListDisplayController
    {
        public ItemListController<ConversationCardDisplayModel> ListController { get; }

        /// <summary>Appelé quand l'utilisateur tape sur une carte.</summary>
        public Action<ConversationCardDisplayModel>? OnCardTap { get; set; }

        public MessagingListDisplayController(bool canBeDriver)
        {
            var items = ConversationFixtures.All
                .Select(MessagingDisplayConverter.ToCard)
                .ToList();

            var tabs = new List<ItemListTab<ConversationCardDisplayModel>>();
            if (canBeDriver)
            {
                tabs.Add(new ItemListTab<ConversationCardDisplayModel>
                {
                    Label     = "Passager",
                    Predicate = c => !c.SelfIsDriver,
                });
                tabs.Add(new ItemListTab<ConversationCardDisplayModel>
                {
                    Label     = "Conducteur",
                    Predicate = c => c.SelfIsDriver,
                });
            }

            var config = new ItemListConfig<ConversationCardDisplayModel>
            {
                Items        = items,
                SearchFields = c => new[] { c.OtherPersonName, c.TripRoute, c.LastMessageSnippet },
                Tabs         = tabs,
            };

            ListController = new ItemListController<ConversationCardDisplayModel>(config);
        }

        public void HandleCardTap(ConversationCardDisplayModel card) =>
            OnCardTap?.Invoke(card);
    }
}
