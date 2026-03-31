namespace Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayModels
{
    public record HomeQuickNavItemDisplayModel(
        string Label,
        string IconKey,
        string BackgroundHex,
        string ForegroundHex,
        string Route,
        string? BadgeText = null
    );

    public record HomeQuickNavGridDisplayModel(
        IReadOnlyList<HomeQuickNavItemDisplayModel> Items
    );
}
