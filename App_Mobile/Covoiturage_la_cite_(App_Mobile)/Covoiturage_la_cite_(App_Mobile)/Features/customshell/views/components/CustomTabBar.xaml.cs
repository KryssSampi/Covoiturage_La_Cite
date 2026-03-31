// Features/shell/views/components/CustomTabBar.xaml.cs
// Branché sur NavigationService — état géré par le service singleton,
// jamais par le composant lui-même.
// Le composant est instancié UNE SEULE FOIS dans MainPage.

using Covoiturage_la_cite__App_Mobile_.Core.Config.Shell;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;
using MauiIcons.Core;
using MauiIcons.Material;
using Microsoft.Maui.Controls.Shapes;

namespace Covoiturage_la_cite__App_Mobile_.Features.shell.views.components;

public partial class CustomTabBar : ContentView
{
    // ── Références visuelles ──
    private readonly List<TabCell> _cells = [];
    private int _selectedIndex = -1;

    // ── Services ──
    private readonly ShellControler? _vm;
    private readonly NavigationService? _navService;

    public CustomTabBar()
    {
        InitializeComponent();

        _vm = IPlatformApplication.Current?.Services.GetService<ShellControler>();
        _navService = IPlatformApplication.Current?.Services.GetService<NavigationService>();

        BuildColumns();
        BuildItems();

        // ── Sélection initiale ──
        var homeIdx = TabBarConfig.Items
            .Select((item, i) => (item, i))
            .First(x => x.item.IsHome).i;
        SelectTab(homeIdx, navigate: false);

        // ── Sync avec le NavigationService ──
        // Si une navigation arrive de l'extérieur (deep link, SideNav),
        // la TabBar se met à jour sans naviguer à nouveau.
        if (_navService is not null)
            _navService.MainNavigationRequested += OnExternalNavigation;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Sync externe (deep link, SideNav, etc.)
    // ─────────────────────────────────────────────────────────────────
    private void OnExternalNavigation(MainNavRequest request)
    {
        var idx = TabBarConfig.Items
            .Select((item, i) => (item, i))
            .FirstOrDefault(x => x.item.Route == request.Route).i;

        // navigate: false → on ne re-déclenche pas GoTo, juste le visuel
        SelectTab(idx, navigate: false);
    }

    // ─────────────────────────────────────────────────────────────────
    //  Construction colonnes
    // ─────────────────────────────────────────────────────────────────
    private void BuildColumns()
    {
        RootTabGrid.ColumnDefinitions.Clear();
        foreach (var _ in TabBarConfig.Items)
            RootTabGrid.ColumnDefinitions.Add(
                new ColumnDefinition { Width = GridLength.Star });
    }

    // ─────────────────────────────────────────────────────────────────
    //  Construction items
    // ─────────────────────────────────────────────────────────────────
    private void BuildItems()
    {
        for (int i = 0; i < TabBarConfig.Items.Count; i++)
        {
            var config = TabBarConfig.Items[i];
            var cell = config.IsHome
                ? BuildHomeCell(config, i)
                : BuildRegularCell(config, i);

            Grid.SetColumn(cell.Root, i);
            RootTabGrid.Add(cell.Root);
            _cells.Add(cell);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Cellule normale
    // ─────────────────────────────────────────────────────────────────
    private TabCell BuildRegularCell(TabBarItem config, int index)
    {
        var icon = new MauiIcon
        {
            Icon = ParseIcon(config.MaterialIcon),
            IconSize = TabBarConfig.RegularIconSize,
            IconColor = Color.FromArgb(TabBarConfig.InactiveColor),
            HorizontalOptions = LayoutOptions.Center,
        };

        var label = new Label
        {
            Text = config.Label,
            FontSize = TabBarConfig.LabelFontSize,
            TextColor = Color.FromArgb(TabBarConfig.InactiveColor),
            HorizontalTextAlignment = TextAlignment.Center,
            FontFamily = "OpenSansRegular",
        };

        var normalStack = new VerticalStackLayout
        {
            VerticalOptions = LayoutOptions.Center,
            HorizontalOptions = LayoutOptions.Center,
            Spacing = 3,
            Children = { icon, label },
        };

        var cardIcon = new MauiIcon
        {
            Icon = ParseIcon(config.MaterialIcon),
            IconSize = TabBarConfig.RegularIconSize,
            IconColor = Color.FromArgb(TabBarConfig.ActiveCardForeground),
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
        };

        var card = new Border
        {
            BackgroundColor = Color.FromArgb(TabBarConfig.ActiveCardBackground),
            IsVisible = false,
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
            StrokeThickness = 0,
            TranslationY = -8,
            WidthRequest = 55,
            HeightRequest = 45,
            Padding = new Thickness(0),
            StrokeShape = new RoundRectangle
            {
                CornerRadius = (float)TabBarConfig.HomeButtonRadius
            },
            Content = cardIcon
        };

        var cellGrid = new Grid
        {
            VerticalOptions = LayoutOptions.Fill,
            HorizontalOptions = LayoutOptions.Fill,
            Children = { normalStack, card },
        };

        var tap = new TapGestureRecognizer();
        tap.Tapped += (_, _) => SelectTab(index, navigate: true);
        cellGrid.GestureRecognizers.Add(tap);

        return new TabCell
        {
            Root = cellGrid,
            NormalView = normalStack,
            Card = card,
            Icon = icon,
            Label = label,
            IsHome = false,
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  Cellule Home
    // ─────────────────────────────────────────────────────────────────
    private TabCell BuildHomeCell(TabBarItem config, int index)
    {
        var normalIcon = new MauiIcon
        {
            Icon = ParseIcon(config.MaterialIcon),
            IconSize = TabBarConfig.HomeIconSize,
            IconColor = Color.FromArgb("#6A5ACD"),
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
        };

        var homeFrame = new Border
        {
            BackgroundColor = Color.FromArgb(TabBarConfig.ActiveCardBackground),
            WidthRequest = TabBarConfig.HomeButtonSize,
            HeightRequest = TabBarConfig.HomeButtonSize,
            IsVisible = false,
            Padding = 0,
            HorizontalOptions = LayoutOptions.Center,
            StrokeThickness = 0,
            VerticalOptions = LayoutOptions.Center,
            TranslationY = -8,
            StrokeShape = new RoundRectangle
            {
                CornerRadius = (float)TabBarConfig.HomeButtonRadius,
            },
        };

        var activeIcon = new MauiIcon
        {
            Icon = ParseIcon(config.MaterialIcon),
            IconSize = TabBarConfig.HomeIconSize,
            IconColor = Colors.White,
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
        };
        homeFrame.Content = activeIcon;

        var container = new Grid
        {
            VerticalOptions = LayoutOptions.Fill,
            HorizontalOptions = LayoutOptions.Fill,
            Children = { normalIcon, homeFrame },
        };

        var tap = new TapGestureRecognizer();
        tap.Tapped += (_, _) => SelectTab(index, navigate: true);
        container.GestureRecognizers.Add(tap);

        return new TabCell
        {
            Root = container,
            NormalView = normalIcon,
            Card = homeFrame,
            Icon = activeIcon,
            IsHome = true,
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  Sélection d'un onglet
    //  navigate: true  → déclenche NavigationService.GoTo()
    //  navigate: false → visuel uniquement (sync externe)
    // ─────────────────────────────────────────────────────────────────
    private void SelectTab(int index, bool navigate)
    {
        if (index == _selectedIndex) return;
        _selectedIndex = index;

        for (int i = 0; i < _cells.Count; i++)
        {
            var cell = _cells[i];
            bool active = i == index;

            MainThread.BeginInvokeOnMainThread(async () =>
            {
                cell.Card.IsVisible = active;
                cell.NormalView.IsVisible = !active;
                if (cell.Label is not null)
                    cell.Label.IsVisible = !active;

                if (active)
                {
                    if (!navigate)
                        cell.Card.Scale = 1.08;
                    else
                        await cell.Card.ScaleTo(1.08, 120, Easing.CubicOut);
                }
                else
                {
                    cell.Card.Scale = 1.0;
                }
            });
        }

        if (navigate && _navService is not null)
        {
            var route = TabBarConfig.Items[index].Route;

            // ── Passe par le NavigationService, pas directement par Shell ──
            _navService.GoTo(route);

            // Mise à jour du titre
            _vm?.UpdateTitle(TabBarConfig.Items[index].Label);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  API publique : sync depuis l'extérieur (deep link, SideNav)
    // ─────────────────────────────────────────────────────────────────
    public void SelectByRoute(string route)
    {
        var idx = TabBarConfig.Items
            .Select((item, i) => (item, i))
            .FirstOrDefault(x => x.item.Route == route).i;
        SelectTab(idx, navigate: false);
    }

    // ─────────────────────────────────────────────────────────────────
    //  Nettoyage
    // ─────────────────────────────────────────────────────────────────
    ~CustomTabBar()
    {
        if (_navService is not null)
            _navService.MainNavigationRequested -= OnExternalNavigation;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Parsing icône Material
    // ─────────────────────────────────────────────────────────────────
    private static MaterialIcons ParseIcon(string name)
    {
        if (Enum.TryParse<MaterialIcons>(name, ignoreCase: true, out var result))
            return result;
        return MaterialIcons.Circle;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Modèle interne cellule
    // ─────────────────────────────────────────────────────────────────
    private class TabCell
    {
        public required View Root { get; init; }
        public required View NormalView { get; init; }
        public required View Card { get; init; }
        public required View Icon { get; init; }
        public Label? Label { get; init; }
        public required bool IsHome { get; init; }
    }
}