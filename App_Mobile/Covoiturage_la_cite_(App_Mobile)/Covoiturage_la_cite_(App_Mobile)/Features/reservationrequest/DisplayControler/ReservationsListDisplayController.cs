// ============================================================
//  Features/reservationrequest/DisplayControler/
//  ReservationsListDisplayController.cs
//
//  Orchestre la liste des réservations :
//   - Onglet "Mes réservations"   → rôle passager  (ReservationModel)
//   - Onglet "Demandes reçues"    → rôle conducteur (ReservationRequestModel)
//   Le deuxième onglet n'apparaît que si canBeDriver = true.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayControler
{
    public class ReservationsListDisplayController
    {
        public ItemListController<ReservationListCardDisplayModel> ListController { get; }

        /// <summary>Injecté par la page : appelé quand l'utilisateur tape sur une carte.</summary>
        public Action<ReservationListCardDisplayModel>? OnCardTap { get; set; }

        public ReservationsListDisplayController(bool canBeDriver)
        {
            // Cartes passager
            var passengerCards = ReservationFixtures.PassengerReservations
                .Select(ReservationRequestDisplayConverter.ToPassengerCard)
                .ToList();

            // Cartes conducteur (seulement si autorisé)
            var driverCards = canBeDriver
                ? ReservationFixtures.ReceivedRequests
                    .Select(ReservationRequestDisplayConverter.ToDriverCard)
                    .ToList()
                : new List<ReservationListCardDisplayModel>();

            // Source unifiée
            var allCards = passengerCards.Concat(driverCards).ToList();

            var tabs = canBeDriver
                ? new List<ItemListTab<ReservationListCardDisplayModel>>
                {
                    new()
                    {
                        Label     = "Mes réservations",
                        Predicate = c => c.Role == ReservationCardRole.Passenger,
                    },
                    new()
                    {
                        Label     = "Demandes reçues",
                        Predicate = c => c.Role == ReservationCardRole.Driver,
                    },
                }
                : new List<ItemListTab<ReservationListCardDisplayModel>>();

            var config = new ItemListConfig<ReservationListCardDisplayModel>
            {
                SearchPlaceholder   = "Rechercher une réservation…",
                SearchFields        = c => new[] { c.Departure, c.Destination, c.PersonName, c.Date },
                Items               = allCards,
                EmptyStateTitle     = "Aucune réservation",
                EmptyStateSubtitle  = "Vos réservations apparaîtront ici.",
                EmptyStateIconGlyph = "\uF395",  // Calendar
                Tabs                = tabs,
            };

            ListController = new ItemListController<ReservationListCardDisplayModel>(config);
        }

        public void HandleCardTap(ReservationListCardDisplayModel card)
            => OnCardTap?.Invoke(card);
    }
}
