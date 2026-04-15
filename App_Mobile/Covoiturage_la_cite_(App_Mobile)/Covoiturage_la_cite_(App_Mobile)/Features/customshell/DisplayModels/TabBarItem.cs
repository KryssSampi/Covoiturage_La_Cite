using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels
{

    /// <summary>Définition d'un onglet de la TabBar custom.</summary>
    public class TabBarItem
    {
        /// <summary>Icône Material (nom de l'enum MaterialIcons, ex: "Home", "DirectionsCar").</summary>
        public string MaterialIcon { get; init; } = "Home";

        /// <summary>Label affiché sous l'icône (masqué pour le tab Home central).</summary>
        public string Label { get; init; } = "";

        /// <summary>Route Shell cible, ex: "//accueil".</summary>
        public string Route { get; init; } = "";

        /// <summary>
        /// True = cet item est le bouton Home central (style carte #08316e).
        /// Il doit y en avoir exactement UN dans la liste.
        /// </summary>
        public bool IsHome { get; init; } = false;
    }
}
