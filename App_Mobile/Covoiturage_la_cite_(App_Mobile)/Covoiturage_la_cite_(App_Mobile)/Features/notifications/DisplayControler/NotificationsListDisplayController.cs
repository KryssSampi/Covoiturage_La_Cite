// ============================================================
//  Features/notifications/DisplayControler/
//  NotificationsListDisplayController.cs
//
//  Orchestre la liste de notifications :
//   - Construit un ItemListController<NotificationCardDisplayModel>
//   - Ajoute 2 onglets (Passager / Conducteur) quand canBeDriver
//   - Expose OnCardTap (injecté par la page pour la navigation)
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayControler
{
    public class NotificationsListDisplayController
    {
        public ItemListController<NotificationCardDisplayModel> ListController { get; }

        /// <summary>Injecté par la page : appelé quand l'utilisateur tape sur une carte.</summary>
        public Action<NotificationCardDisplayModel>? OnCardTap { get; set; }

        public NotificationsListDisplayController(bool canBeDriver)
        {
            var cards = NotificationFixtures.All
                .Select(NotificationsDisplayConverter.ToCardDisplayModel)
                .ToList();

            var tabs = canBeDriver
                ? new List<ItemListTab<NotificationCardDisplayModel>>
                {
                    new()
                    {
                        Label     = "Passager",
                        Predicate = c => !c.IsDriverRole,
                    },
                    new()
                    {
                        Label     = "Conducteur",
                        Predicate = c => c.IsDriverRole,
                    },
                }
                : new List<ItemListTab<NotificationCardDisplayModel>>();

            var config = new ItemListConfig<NotificationCardDisplayModel>
            {
                SearchPlaceholder  = "Rechercher une notification…",
                SearchFields       = c => new[] { c.Title, c.Snippet, c.TypeLabel },
                Items              = cards,
                EmptyStateTitle    = "Aucune notification",
                EmptyStateSubtitle = "Vous n'avez aucune notification pour l'instant.",
                EmptyStateIconGlyph = "\uF1F6",  // Bell
                Tabs               = tabs,
            };

            ListController = new ItemListController<NotificationCardDisplayModel>(config);
        }

        /// <summary>Appelé depuis le code-behind quand l'utilisateur tape sur une carte.</summary>
        public void HandleCardTap(NotificationCardDisplayModel card)
            => OnCardTap?.Invoke(card);
    }
}
