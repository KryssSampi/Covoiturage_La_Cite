using Covoiturage_la_cite__App_Mobile_.Core.Config.Shell;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayModels;
using MauiIcons.Core;

namespace Covoiturage_la_cite__App_Mobile_.Features.shell.views.ui;

public partial class SideNavFooter : ContentView
{
    private readonly ShellControler? _vm;

    public SideNavFooter()
    {
        InitializeComponent();
        _vm = IPlatformApplication.Current?.Services.GetService<ShellControler>();
        BuildFooterItems();
    }

    private void BuildFooterItems()
    {
        foreach (var item in SideNavConfig.FooterItems)
        {
            FooterItemsContainer.Add(CreateFooterItem(item));
        }
    }

    private View CreateFooterItem(SideNavFooterItem item)
    {
        var iconColor = string.IsNullOrEmpty(item.IconColor)
            ? Color.FromArgb("#545D6E")
            : Color.FromArgb(item.IconColor);

        var textColor = string.IsNullOrEmpty(item.IconColor)
            ? Color.FromArgb("#3D4A5C")
            : Color.FromArgb(item.IconColor);

        var grid = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition { Width = 44 },
                new ColumnDefinition { Width = GridLength.Star },
            },
            Padding = new Thickness(16, 0, 16, 0),
            HeightRequest = 50,
            BackgroundColor = Colors.Transparent,
        };
        if (item.IconFactory is MauiIcon mauiIcon)
            mauiIcon.IconColor = iconColor;

        var icon = new Border
        {
            Content = item.IconFactory,
            // Border n'a pas VerticalTextAlignment ni HorizontalTextAlignment
            // Ces propriétés doivent être appliquées sur le contenu (par exemple, un Label ou un View)
            // Si vous souhaitez centrer le contenu, vous pouvez utiliser HorizontalOptions et VerticalOptions
            StrokeThickness = 0,
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
        };
        Grid.SetColumn(icon, 0);

        var label = new Label
        {
            Text = item.Label,
            FontFamily = "OpenSansRegular",
            FontSize = 14,
            TextColor = textColor,
            VerticalTextAlignment = TextAlignment.Center,
        };
        Grid.SetColumn(label, 1);

        grid.Add(icon);
        grid.Add(label);

        // Gestes
        var tapGesture = new TapGestureRecognizer();
        tapGesture.Tapped += async (s, e) =>
        {
            await grid.FadeTo(0.6, 80);
            await grid.FadeTo(1.0, 80);

            Shell.Current.FlyoutIsPresented = false;

            // Action spéciale : déconnexion
            if (item.ActionKey == "logout")
            {
                _vm?.LogoutCommand.Execute(null);
                return;
            }

            if (!string.IsNullOrEmpty(item.Route))
                await Shell.Current.GoToAsync(item.Route);
        };

        var pointerGesture = new PointerGestureRecognizer();
        pointerGesture.PointerEntered += (s, e)
            => grid.BackgroundColor = Color.FromArgb("#0A000000");
        pointerGesture.PointerExited += (s, e)
            => grid.BackgroundColor = Colors.Transparent;

        grid.GestureRecognizers.Add(tapGesture);
        grid.GestureRecognizers.Add(pointerGesture);

        return grid;
    }
}
