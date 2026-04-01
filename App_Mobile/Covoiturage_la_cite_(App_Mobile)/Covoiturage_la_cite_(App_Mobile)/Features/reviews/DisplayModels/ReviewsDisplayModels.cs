// ============================================================
//  Features/reviews/DisplayModels/ReviewsDisplayModels.cs
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Features.reviews.DisplayModels
{
    public enum ReviewDirection { Received, Given }

    public record ReviewsCardDisplayModel(
        string          Id,
        ReviewDirection Direction,
        string          PersonInitial,
        string          PersonName,
        string          DateLabel,
        string          TripRoute,      // "Ottawa → Orléans"
        string          Comment,
        int             Stars,
        string          StarsLabel      // "★★★★☆"
    );
}
