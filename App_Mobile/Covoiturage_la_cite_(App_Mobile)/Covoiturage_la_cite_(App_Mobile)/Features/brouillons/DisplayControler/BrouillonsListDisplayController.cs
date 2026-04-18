using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayControler
{
    public class BrouillonsListDisplayController
    {
        public ItemListController<BrouillonCardDisplayModel> ListController { get; }

        public Action<BrouillonCardDisplayModel>? OnCardTap { get; set; }

        public BrouillonsListDisplayController()
        {
var items = BrouillonsFixtures.Cards();

            var config = new ItemListConfig<BrouillonCardDisplayModel>
            {
                Items = items,
SearchFields = c => new[] { c.Route.FromLabel, c.Route.ToLabel, c.ScheduleLabel },
                EmptyStateTitle = "Aucun brouillon",
                EmptyStateSubtitle = "Créez votre premier brouillon de trajet.",
            };

            ListController = new ItemListController<BrouillonCardDisplayModel>(config);
        }

        public void HandleCardTap(BrouillonCardDisplayModel card) => OnCardTap?.Invoke(card);
    }
}

