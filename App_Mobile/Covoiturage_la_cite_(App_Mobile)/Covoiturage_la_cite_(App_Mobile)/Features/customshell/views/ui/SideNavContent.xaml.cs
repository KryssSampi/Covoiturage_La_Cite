using Covoiturage_la_cite__App_Mobile_.Core.Config.Shell;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels;
using MauiIcons.Core;
namespace Covoiturage_la_cite__App_Mobile_.Features.shell.views.ui
{

    public partial class SideNavContent : ContentView
    {
        public SideNavContent()
        {
            InitializeComponent();
            BuildNavItems();
        }

        private void BuildNavItems()
        {
            var userVm = IPlatformApplication.Current.Services.GetRequiredService<UserViewModel>();
            var role = userVm.Role;
            foreach (var item in SideNavConfig.MainItems.Where(i => i.RequiredRole == null || i.RequiredRole == role.ToString()))
            {
                NavItemsContainer.Add(CreateNavItem(item));
            }
        }

        // ── Fabrique un label de navigation (icône + texte) ──
        private static View CreateNavItem(SideNavItem item)
        {
            var iconColor = string.IsNullOrEmpty(item.IconColor)
                ? Color.FromArgb("#1A56CC")
                : Color.FromArgb(item.IconColor);

            var textColor = string.IsNullOrEmpty(item.IconColor)
                ? Color.FromArgb("#0D1624")
                : Color.FromArgb(item.IconColor);

            // Conteneur principal de l'item
            var grid = new Grid
            {
                ColumnDefinitions =
            {
                new ColumnDefinition { Width = 44 },   // Icône
                new ColumnDefinition { Width = GridLength.Star }, // Label
            },
                Padding = new Thickness(16, 0, 16, 0),
                HeightRequest = 52,
                BackgroundColor = Colors.Transparent,
            };

            // ── Icône Fluent ──
            var mauiIcon = item.IconFactory as MauiIcon;
            if (mauiIcon != null)
            {
                mauiIcon.IconColor = iconColor;
            }

            // ── Icône Fluent ──
            var icon = new Border
            {
                Content = item.IconFactory,
                StrokeThickness = 0,
                Padding = new Thickness(8),
                BackgroundColor = Colors.Transparent,
            };
            Grid.SetColumn(icon, 0);

            // ── Libellé ──
            var label = new Label
            {
                Text = item.Label,
                FontFamily = "OpenSansRegular",
                FontSize = 14,
                FontAttributes = FontAttributes.None,
                TextColor = textColor,
                VerticalTextAlignment = TextAlignment.Center,
            };
            Grid.SetColumn(label, 1);

            grid.Add(icon);
            grid.Add(label);

            // ── Effet hover / tap ──
            var tapGesture = new TapGestureRecognizer();
            tapGesture.Tapped += async (s, e) =>
            {
                // Feedback visuel
                await grid.FadeTo(0.6, 80);
                await grid.FadeTo(1.0, 80);

                // Ferme le flyout puis navigue
                Shell.Current.FlyoutIsPresented = false;
                await Shell.Current.GoToAsync(item.Route);
            };

            // Highlight au-dessus du tap
            var pointerGesture = new PointerGestureRecognizer();
            pointerGesture.PointerEntered += (s, e)
                => grid.BackgroundColor = Color.FromArgb("#0F1A56CC");
            pointerGesture.PointerExited += (s, e)
                => grid.BackgroundColor = Colors.Transparent;

            grid.GestureRecognizers.Add(tapGesture);
            grid.GestureRecognizers.Add(pointerGesture);

            // Séparateur léger entre groupes (tous les 3 items)
            // Personnalisable dans SideNavConfig si nécessaire

            return grid;
        }
    }
}