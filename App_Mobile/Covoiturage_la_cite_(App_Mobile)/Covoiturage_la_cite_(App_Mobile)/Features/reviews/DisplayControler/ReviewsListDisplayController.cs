// ============================================================
//  Features/reviews/DisplayControler/ReviewsListDisplayController.cs
//  2 onglets : Reçus / Laissés.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.reviews.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.reviews.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.reviews.DisplayControler
{
    public class ReviewsListDisplayController
    {
        public ItemListController<ReviewsCardDisplayModel> ListController { get; }

        public ReviewsListDisplayController()
        {
            var tabs = new List<ItemListTab<ReviewsCardDisplayModel>>
            {
                new() { Label = "Reçus", Predicate = r => r.Direction == ReviewDirection.Received },
                new() { Label = "Laissés", Predicate = r => r.Direction == ReviewDirection.Given  },
            };

            var config = new ItemListConfig<ReviewsCardDisplayModel>
            {
                Items        = ReviewsFixtures.All().ToList(),
                SearchFields = r => new[] { r.PersonName, r.TripRoute, r.Comment },
                Tabs         = tabs,
                EmptyStateTitle    = "Aucun avis",
                EmptyStateSubtitle = "Vos évaluations apparaîtront ici après vos trajets.",
            };

            ListController = new ItemListController<ReviewsCardDisplayModel>(config);
        }
    }
}
