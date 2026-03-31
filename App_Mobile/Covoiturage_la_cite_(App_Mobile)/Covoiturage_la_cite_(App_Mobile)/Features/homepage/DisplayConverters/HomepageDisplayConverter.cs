using Covoiturage_la_cite__App_Mobile_.Core.Config;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayConverters
{
    public static class HomepageDisplayConverter
    {
        public static HomeSearchBarDisplayModel ToSearchBar(IReadOnlyList<LieuxFavorisModel> places)
        {
            var chips = places.Select(ToChip).ToList();
            return new HomeSearchBarDisplayModel
            {
                Placeholder = "Rechercher une destination…",
                Chips = chips,
            };
        }

        public static HomeQuickNavGridDisplayModel ToQuickNav(IReadOnlyList<HomeQuickNavItemConfig> items)
        {
            return new HomeQuickNavGridDisplayModel(items.Select(i =>
                new HomeQuickNavItemDisplayModel(
                    i.Label,
                    i.IconKey,
                    i.BackgroundHex,
                    i.ForegroundHex,
                    i.Route,
                    i.BadgeText
                )).ToList());
        }

        private static HomeSearchChipDisplayModel ToChip(LieuxFavorisModel place)
        {
            var (icon, bg, fg) = place.IconTag switch
            {
                "domicile" => ("Home", "#E1F5EE", "#0F6E56"),
                "travail" or "work" => ("Work", "#FAEEDA", "#854F0B"),
                "campus" => ("School", "#E8F0FE", "#1A56CC"),
                "ville" => ("LocationCity", "#E8F0FE", "#1A56CC"),
                _ => ("Place", "#E8F0FE", "#1A56CC"),
            };

            return new HomeSearchChipDisplayModel(
                Label: place.Pseudonyme,
                IconKey: icon,
                BackgroundHex: bg,
                ForegroundHex: fg,
                Value: place.Adresse
            );
        }
    }
}
