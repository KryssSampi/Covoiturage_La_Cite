using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels;
using MauiIcons.Core;
using MauiIcons.Fluent.Filled;
using MauiIcons.FontAwesome;
using MauiIcons.Material;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Covoiturage_la_cite__App_Mobile_.Core.Config.Shell
{
    // ─────────────────────────────────────────────────────────────
    //  ── CONFIG ── : Définissez ici votre menu
    //  Fluent Icons cheatsheet : https://icon.horse/icon/fluentui-system-icons
    //  Glyphes courants :
    //    \uF488 Home filled         \uF489 Home regular
    //    \uF51C Car filled          \uF51B Car regular
    //    \uF29E Chat filled         \uF29D Chat regular
    //    \uF1F4 Chart filled        \uF1F3 Chart regular
    //    \uF3D8 Person filled       \uF3D7 Person regular
    //    \uF6E0 Star filled         \uF6DF Star regular
    //    \uF274 Calendar filled     \uF273 Calendar regular
    //    \uF2B5 Heart filled        \uF2B4 Heart regular
    //    \uF5AD Map filled          \uF5AC Map regular
    //    \uF59C Location filled     \uF59B Location regular
    //    \uF66A Shield filled       \uF669 Shield regular
    //    \uF3BE Info filled         \uF3BD Info regular
    //    \uF2A0 Settings filled     \uF29F Settings regular
    //    \uF3BA Sign Out filled     \uF3B9 Sign Out regular
    // ─────────────────────────────────────────────────────────────
    public static class SideNavConfig
    {
        public static readonly IReadOnlyList<SideNavItem> MainItems = new List<SideNavItem>
        {
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.Home12Filled,
                    IconSize = 22,
                },
                Label      = "Accueil",
                Route      = "accueil",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = MaterialIcons.ElectricCar,
                    IconSize = 22,
                },
                Label      = "Mes trajets",
                Route      = "trajets",
            },
            new()
            {
                IconFactory  = new MauiIcon
                {
                    Icon = MaterialIcons.CalendarToday,
                    IconSize = 22,
                },
                Label      = "Planificateur",
                Route      = "planifier",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.Chat20Filled,
                    IconSize = 22,
                },
                Label      = "Messages",
                Route      = "messages",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.ChartMultiple20Filled,
                    IconSize = 22,
                },
                Label      = "Statistiques & GoBoard",
                Route      = "stats",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.Heart20Filled,
                    IconSize = 22,
                },
                Label      = "Mes favoris",
                Route      = "favoris",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = MaterialIcons.ChecklistRtl,
                    IconSize = 22,
                },
                Label      = "Demande",
                Route      = "demandes",
                RequiredRole = "Driver",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.Person20Filled,
                    IconSize = 22,
                },
                Label      = "Conducteurs favoris",
                Route      = "conducteurs_favoris",
                RequiredRole = "Passenger",
            },
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.Person20Filled,
                    IconSize = 22,
                },
                Label      = "Mon profil",
                Route      = "profil",
            },
        };

        public static readonly IReadOnlyList<SideNavFooterItem> FooterItems =
        [
            new()
            {
                IconFactory = new MauiIcon
                {
                    Icon = FluentFilledIcons.SignOut20Filled,
                    IconSize = 22,
                },
                Label      = "Déconnexion",
                ActionKey  = "logout",
            },
        ];
    }
}
