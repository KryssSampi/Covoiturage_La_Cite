using Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.historique.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayControler
{
    public class HistoriqueListDisplayController
    {
        public ItemListController<HistoriqueCardDisplayModel> ListController { get; }

        public Action<HistoriqueCardDisplayModel>? OnCardTap { get; set; }

        public HistoriqueListDisplayController(bool canBeDriver)
        {
            var items = HistoriqueFixtures.All().ToList();

            var tabs = new List<ItemListTab<HistoriqueCardDisplayModel>>();
            if (canBeDriver)
            {
                tabs.Add(new ItemListTab<HistoriqueCardDisplayModel>
                    { Label = "Passager", Predicate = c => c.Role == HistoriqueRole.Passenger });
                tabs.Add(new ItemListTab<HistoriqueCardDisplayModel>
                    { Label = "Conducteur", Predicate = c => c.Role == HistoriqueRole.Driver });
            }

            var config = new ItemListConfig<HistoriqueCardDisplayModel>
            {
                Items        = items,
                SearchFields = c => new[]
                {
                    c.Route.FromLabel,
                    c.Route.ToLabel,
                    c.OtherPersonName,
                    c.DateTimeLabel,
                },
                Tabs              = tabs,
                EmptyStateTitle   = "Aucun trajet",
                EmptyStateSubtitle = "Vos trajets complétés apparaîtront ici.",
            };

            ListController = new ItemListController<HistoriqueCardDisplayModel>(config);
        }

        public void HandleCardTap(HistoriqueCardDisplayModel card) => OnCardTap?.Invoke(card);
    }
}

