// Features/planner/DisplayController/PlannerDisplayController.Extensions.cs
// Extension du PlannerDisplayController :
//   - SyncFiltersFromItemList : appelée par PlannerItemListController
//     pour synchroniser les filtres sélectionnés dans l'ItemList
//     vers l'état interne du controller.

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayController;

public partial class PlannerDisplayController
{
    /// <summary>
    /// Synchronise les filtres statut sélectionnés dans l'ItemList
    /// vers l'état interne (_filterState), puis réapplique les calculs.
    /// Appelée depuis PlannerItemListController.OnFilterChanged.
    /// </summary>
    public void SyncFiltersFromItemList(
        HashSet<DriverTripStatusEnum>           driverStatuses,
        HashSet<PassengerReservationStatusEnum> passengerStatuses)
    {
        _filterState.ActiveDriverStatuses.Clear();
        foreach (var s in driverStatuses)
            _filterState.ActiveDriverStatuses.Add(s);

        _filterState.ActivePassengerStatuses.Clear();
        foreach (var s in passengerStatuses)
            _filterState.ActivePassengerStatuses.Add(s);

        ApplyAll();
    }
}
