// ============================================================
//  Features/favoris/DisplayControler/FavorisListDisplayController.cs
//  Contrôleur de liste des favoris.
//  3 onglets fixes : Lieux | Personnes | Alertes.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.favoris.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.favoris.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.favoris.DisplayControler
{
    public class FavorisListDisplayController
    {
        public ItemListController<FavoriteCardDisplayModel> ListController { get; }

        /// <summary>Appelé quand l'utilisateur tape sur une carte.</summary>
        public Action<FavoriteCardDisplayModel>? OnCardTap { get; set; }

        public FavorisListDisplayController()
        {
            var items = FavorisFixtures.All().ToList();

            var tabs = new List<ItemListTab<FavoriteCardDisplayModel>>
            {
                new() { Label = "Lieux",     Predicate = c => c.Type == FavoriteType.Place  },
                new() { Label = "Personnes", Predicate = c => c.Type == FavoriteType.Person },
                new() { Label = "Alertes",   Predicate = c => c.Type == FavoriteType.Alert  },
            };

            var config = new ItemListConfig<FavoriteCardDisplayModel>
            {
                Items        = items,
                SearchFields = c => new[] { c.Name, c.SubLabel, c.PlaceAddress ?? "" },
                Tabs         = tabs,
            };

            ListController = new ItemListController<FavoriteCardDisplayModel>(config);
        }

        public void HandleCardTap(FavoriteCardDisplayModel card) =>
            OnCardTap?.Invoke(card);
    }
}
